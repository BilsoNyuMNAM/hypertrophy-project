
import {getPrismaClient} from "../../../../../lib/prismaClient";
import { Hono } from "hono";

type PrismaClient = ReturnType<typeof getPrismaClient>;
type volume = {
    "muscle_name": string,
    "set":number
}
const volumeRoute = new Hono<{ Bindings: { DATABASE_URL: string } }>();

type VolumeSeedRow = {
    muscle_name: string
    set: number
}

type ResolveVolumeSeedRowsInput = {
    weekNumber: number
    currentRows: VolumeSeedRow[]
    fallbackRows: VolumeSeedRow[]
    frequencyMuscles: string[]
}

function parseWeekNumber(weekName: string): number {
    const weekNumber = Number(weekName.replace(/\D/g, ""))
    return Number.isFinite(weekNumber) ? weekNumber : 0
}

export function resolveVolumeSeedRows({
    weekNumber,
    currentRows,
    fallbackRows,
    frequencyMuscles,
}: ResolveVolumeSeedRowsInput): VolumeSeedRow[] {
    if (currentRows.length > 0) {
        return currentRows
    }

    if (weekNumber !== 1) {
        return []
    }

    if (fallbackRows.length > 0) {
        return fallbackRows
    }

    return frequencyMuscles.map((muscle_name) => ({
        muscle_name,
        set: 0,
    }))
}

export async function volume(prisma:PrismaClient, weekId:number, volume:volume[]){
    const data = await Promise.all(volume.map(async (vol)=>{
        const muscle = await prisma.muscle.findUnique({
            where:{
                muscle_name: vol.muscle_name
            }
        })
        if (!muscle) {
            console.error(`Muscle not found: ${vol.muscle_name}`)
            return null
        }
        return {
            muscleId: muscle.id,
            weekId: weekId,
            set: vol.set
        }
    })
    )
    // Filter out null values (muscles that weren't found)
    const validData = data.filter((item): item is NonNullable<typeof item> => item !== null)
    
    if (validData.length === 0) {
        console.error("No valid volume data to create - no muscles found in database")
        return []
    }
    
    const volumeResult = await prisma.startingVolume.createManyAndReturn({
        data: validData
    })
    return volumeResult;
}


volumeRoute.get("/:weekId", async (c)=>{
    const prisma = getPrismaClient(c.env)
    const weekId = Number(c.req.param("weekId"))
    const muscleVolume: Record<string, number> = {}
    const weekRecord = await prisma.week.findFirst({
        where:{
            id:weekId,
            deletedAt: null,
        },
        select:{
            id: true,
            week_name: true,
            mesocycleId: true,
            session:{
                where: {
                    deletedAt: null,
                },
                select:{
                    id:true,
                    session_name:true,
                    exerciselogs:{
                        where: {
                            deletedAt: null,
                        },
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
                            set: {
                                where: {
                                    deletedAt: null,
                                },
                                select: {
                                    id: true,
                                },
                            },
                            
                        },
                        
                    }
                }
            }
        }
    })
    if (!weekRecord) {
        return c.json({
            message: "Week not found",
            volume: [],
        }, 404)
    }
     // @ts-ignore
     //session = [{}, {}, {}]
    const session = weekRecord?.session.flatMap(session=> 
        session.exerciselogs
    )
    session?.forEach(log=>{
        if(log.exercise.muscle.muscle_name in muscleVolume){
            muscleVolume[log.exercise.muscle.muscle_name] += log.set.length;
        }
        else{
            muscleVolume[log.exercise.muscle.muscle_name] = log.set.length;
        }
    })

    const currentWeekVolumeRows = await prisma.startingVolume.findMany({
        where:{
            weekId:weekId,
            deletedAt: null,
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

    const currentRows: VolumeSeedRow[] = currentWeekVolumeRows.map((vol) => ({
        muscle_name: vol.muscle.muscle_name,
        set: vol.set,
    }))

    const weekNumber = parseWeekNumber(weekRecord?.week_name || "")
    let fallbackRows: VolumeSeedRow[] = []
    let frequencyMuscles: string[] = []

    if (weekRecord && currentRows.length === 0 && weekNumber === 1) {
        const fallbackWeek = await prisma.week.findFirst({
            where: {
                mesocycleId: weekRecord.mesocycleId,
                deletedAt: null,
                id: {
                    not: weekRecord.id,
                },
                startingvolume: {
                    some: {
                        deletedAt: null,
                    },
                },
            },
            select: {
                id: true,
            },
            orderBy: {
                id: "asc",
            },
        })

        if (fallbackWeek) {
            const fallbackVolumeRows = await prisma.startingVolume.findMany({
                where: {
                    weekId: fallbackWeek.id,
                    deletedAt: null,
                },
                select: {
                    set: true,
                    muscle: {
                        select: {
                            muscle_name: true,
                        },
                    },
                },
            })

            fallbackRows = fallbackVolumeRows.map((row) => ({
                muscle_name: row.muscle.muscle_name,
                set: row.set,
            }))
        } else {
            const frequencyRows = await prisma.frequency.findMany({
                where: {
                    mesocycleId: weekRecord.mesocycleId,
                    deletedAt: null,
                },
                select: {
                    muscle: {
                        select: {
                            muscle_name: true,
                        },
                    },
                },
            })

            frequencyMuscles = Array.from(
                new Set(frequencyRows.map((row) => row.muscle.muscle_name))
            )
        }
    }

    const displayRows = resolveVolumeSeedRows({
        weekNumber,
        currentRows,
        fallbackRows,
        frequencyMuscles,
    })

    const formattedvolumeResult = displayRows.map((vol) => ({
        starting_volume: vol.set,
        muscle_name: vol.muscle_name,
        volume_completed: muscleVolume[vol.muscle_name] ? muscleVolume[vol.muscle_name] : 0,
    }))

    
      
    
    return c.json({
        volume:formattedvolumeResult,
        // muscleVolume:muscleVolume
    })

})

// volumeRoute.get("")


export default volumeRoute
