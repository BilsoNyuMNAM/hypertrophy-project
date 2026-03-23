import { getPrismaClient } from "../../../../lib/prismaClient";
import { Hono } from "hono";
  type PrismaClient = ReturnType<typeof getPrismaClient>;

type Frequency = {
    muscle_name: string,
    timesPerWeek: number
}
const frequencyroute = new Hono<{ Bindings: { DATABASE_URL: string } }>();
export async function  frequency( frequencies: Frequency[], id:number, prisma:PrismaClient){
    
       const data = await Promise.all(
        frequencies.map(async (frequency)=>{
            const muscleId = await prisma.muscle.findUnique({
                where:{
                    muscle_name: frequency.muscle_name
                }
            })
            return {
                mesocycleId: id,
                muscleId: muscleId?.id,
                timesPerWeek: frequency.timesPerWeek
            }
        })

       )
       const result = await prisma.frequency.createManyAndReturn({
        //@ts-ignore
        data:data
       })
       console.log("result from frequency.ts file", result)
       return result;
}

frequencyroute.get("/muscle", async (c)=>{
    const prisma = getPrismaClient(c.env)   
    const weekId= Number( c.req.query("weekId"))
    const mesoId= Number( c.req.query("mesoId"))
    const muscleName = c.req.query("muscleName")
    if (!muscleName) {
        return c.json({ error: "muscleName query parameter is required" }, 400)
    }
    const muscle = await prisma.muscle.findUnique({
        where: {
            muscle_name: muscleName
        }
    })

    if (!muscle) {
        return c.json({ error: "Muscle not found" }, 404)
    }

    const muscleId = muscle.id
    let showSorenessFeedback = false
    
    const predefinedFrequency = await prisma.mesocycle.findUnique({
        where:{
            id: mesoId
        },
        select:{
            frequency:{
                where:{
                    muscleId: muscleId
                },
                select:{
                    timesPerWeek:true
                }
            }
        }
    })

    let queryResult = await prisma.session.count({
        where:{
            weekId: weekId,
            exerciselogs:{
                some:{
                    exercise:{
                        muscleId:muscleId
                    }
                }
            }
        }
    })
    queryResult += 1
    queryResult > 1 && queryResult <= predefinedFrequency?.frequency[0]?.timesPerWeek ? showSorenessFeedback = true : showSorenessFeedback = false

    

    console.log(queryResult)
    return c.json({
        showSorenessFeedback: showSorenessFeedback
    },200)
})       

export default frequencyroute;