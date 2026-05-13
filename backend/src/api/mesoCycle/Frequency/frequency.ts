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
            const muscle = await prisma.muscle.findUnique({
                where:{
                    muscle_name: frequency.muscle_name
                }
            })
            if (!muscle) {
                console.error(`Muscle not found: ${frequency.muscle_name}`)
                return null
            }
            return {
                mesocycleId: id,
                muscleId: muscle.id,
                timesPerWeek: frequency.timesPerWeek
            }
        })

       )
       // Filter out null values (muscles that weren't found)
       const validData = data.filter((item): item is NonNullable<typeof item> => item !== null)
       
       if (validData.length === 0) {
           console.error("No valid frequency data to create - no muscles found in database")
           return []
       }
       
       const result = await prisma.frequency.createManyAndReturn({
        data: validData
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
    
    const activeMesocycle = await prisma.mesocycle.findFirst({
        where:{
            id: mesoId,
            deletedAt: null,
        },
        select:{
            frequency:{
                where:{
                    muscleId: muscleId,
                    deletedAt: null,
                },
                select:{
                    timesPerWeek:true
                }
            }
        }
    })

    if (!activeMesocycle) {
        return c.json({ error: "Mesocycle not found" }, 404)
    }

    let queryResult = await prisma.session.count({
        where:{
            weekId: weekId,
            deletedAt: null,
            exerciselogs:{
                some:{
                    deletedAt: null,
                    exercise:{
                        muscleId:muscleId
                    }
                }
            }
        }
    })
    queryResult += 1
    queryResult > 1 &&
    queryResult <= (activeMesocycle?.frequency[0]?.timesPerWeek ?? 0)
        ? showSorenessFeedback = true
        : showSorenessFeedback = false

    

    console.log(queryResult)
    return c.json({
        showSorenessFeedback: showSorenessFeedback
    },200)
})       

export default frequencyroute;
