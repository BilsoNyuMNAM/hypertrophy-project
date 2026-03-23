
import {getPrismaClient} from "../../../../../lib/prismaClient";
import { Hono } from "hono";

type PrismaClient = ReturnType<typeof getPrismaClient>;
type volume = {
    "muscle_name": string,
    "set":number
}
const volumeRoute = new Hono<{ Bindings: { DATABASE_URL: string } }>();

export async function volume(prisma:PrismaClient, weekId:number, volume:volume[]){
    const data = await Promise.all(volume.map(async (vol)=>{
        const muscleId = await prisma.muscle.findUnique({
            where:{
                muscle_name: vol.muscle_name
            }
        })
        return {
            muscleId: muscleId?.id,
            weekId: weekId,
            set: vol.set
        }
    })
    )
    const volumeResult = await prisma.startingVolume.createManyAndReturn({
        //@ts-ignore
        data:data
    })
    return volumeResult;
}


volumeRoute.get("/:weekId", async (c)=>{
    const prisma = getPrismaClient(c.env)
    const weekId = Number(c.req.param("weekId"))
    let muscleVolume = {};
    const sessions = await prisma.week.findUnique({
        where:{
            id:weekId
        },
        select:{
            session:{
                select:{
                    id:true,
                    session_name:true,
                    exerciselogs:{
                        select:{
                            exerciseId:true,
                            exercise:{
                                select:{
                                    exercise_name:true,
                                    muscle:{
                                        select:{
                                            muscle_name:true
                                        }
                                    }
                                }
                            },
                            _count:{
                                select:{
                                    // set:{
                                    //     select:{
                                    //         reps:true,
                                    //         weight:true,
                                    //         rir:true    
                                    //     }
                                    //  }
                                    set:true    
                                }   
                            }
                            
                        },
                        
                    }
                }
            }
        }
    })
     // @ts-ignore
     //session = [{}, {}, {}]
    const session = sessions?.session.flatMap(session=> 
        session.exerciselogs
    )
    //@ts-ignore
    session.forEach(log=>{
        //@ts-ignore
        if(log.exercise.muscle.muscle_name in muscleVolume){
            //@ts-ignore
            muscleVolume[log.exercise.muscle.muscle_name] += log._count.set;
        }
        else{
            //@ts-ignore
            muscleVolume[log.exercise.muscle.muscle_name] = log._count.set;
        }
    })

    const volumeResult = await prisma.startingVolume.findMany({
        where:{
            weekId:weekId
        },
        select:{
            set:true,
            muscle:{
                select:{
                    muscle_name:true
                }
            }
        }
    })

    const formattedvolumeResult = volumeResult.map(vol=>({
        starting_volume: vol.set,
        muscle_name: vol.muscle.muscle_name,
        //@ts-ignore
        volume_completed: muscleVolume[vol.muscle.muscle_name] ? muscleVolume[vol.muscle.muscle_name] : 0

    }))

    
      
    
    return c.json({
        volume:formattedvolumeResult,
        // muscleVolume:muscleVolume
    })

})

// volumeRoute.get("")


export default volumeRoute