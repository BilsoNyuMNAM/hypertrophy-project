
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
    const result = await prisma.muscle.findMany({
        // where:{
        //     weekId: weekId        
        // },
        // select:{
        //     set:true,
        //     muscle:{
        //         select:{
        //             muscle_name:true
        //         }
        //     }
        // }
        select:{
            muscle_name:true,
            startingvolume:{
                where:{
                    weekId:weekId
                },
                select:{
                    set:true
                }
            }
        }
    })
    

    return c.json({
        result:result
    })
})


export default volumeRoute