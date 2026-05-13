
import { Hono } from "hono";
import { getPrismaClient } from "../../../lib/prismaClient";
import { frequency } from "./Frequency/frequency";
import {week} from "./Week/week";
import {volume} from "./Week/Volume/volume";
import { softDeleteMesocycle } from "../../service/mesocycleService";
const cycle = new Hono<{ Bindings: { DATABASE_URL: string } }>();

type WeekRow = {
    id: number
    week_name: string
}

function parseWeekNumber(weekName: string): number {
    const weekNumber = Number(weekName.replace(/\D/g, ""))
    return Number.isFinite(weekNumber) ? weekNumber : 0
}

export function isWeekUnlocked(weekName: string, startingVolumeCount: number): boolean {
    return parseWeekNumber(weekName) === 1 || startingVolumeCount > 0
}

export function selectWeekOneId(weeks: WeekRow[]): number {
    const weekOne = weeks.find((week) => parseWeekNumber(week.week_name) === 1)
    if (!weekOne) {
        throw new Error("WEEK_ONE_NOT_FOUND")
    }
    return weekOne.id
}


cycle.post("/create", async (c) => {
    const prisma = getPrismaClient(c.env)
    const body = await c.req.json();
    
    const name = body.name;//get the meso_cycle name 
    const id = await prisma.mesocycle.create({
        data:{
            name:name
        }
    })
    
   
    const result = await frequency(body.frequencies, id.id, prisma)
    // console.log("frequency result", result)
    const weekResult = await week(prisma, id.id)
    //@ts-ignore
    // console.log("week result", weekResult)
    const weekOneId = selectWeekOneId(weekResult)
    const volumeResult = await volume(prisma, weekOneId, body.volume);
    console.log("volume result", volumeResult)
    //----------------------------------------
    return c.json({
        messsage:"mesocycle created successfully",
        id: id.id,
        frequencies: result,
        week: weekResult,
        volume: volumeResult
    },201)

})

cycle.get("/all",async(c)=>{
    
    const prisma = getPrismaClient(c.env)

    try{
        const searchResult = await prisma.mesocycle.findMany({
            where: {
                deletedAt: null,
            },
            select:{
                id:true,
                name:true,
                week: {
                    where: {
                        deletedAt: null,
                    },
                    select: {
                        week_name: true,
                        _count: {
                            select: {
                                session: {
                                    where: {
                                        deletedAt: null,
                                    },
                                },
                                startingvolume: {
                                    where: {
                                        deletedAt: null,
                                    },
                                },
                            }
                        }
                    }
                    
                },
            }
        })
        const formattedResult = searchResult.map((result) => {
            const total_session = result.week.reduce((sum, week) => {
                return sum + week._count.session;
            }, 0);

            const unlockedWeeks = result.week.filter(
                (week) => isWeekUnlocked(week.week_name, week._count.startingvolume)
            ).length;
            const completed = Math.max(unlockedWeeks - 1, 0);
            return {
                id: result.id,
                name: result.name,
                completed,
                total_session,
                _count: {
                    week: result.week.length,
                },
            };
        });
        return c.json({
        message:"Fetched is successfull",
        data: formattedResult
    })
    }
    catch(error){
        console.log("error", error)
        return c.json({
            erroeMessage:"something happened",
            error: error
        })
    }

   
    
    
})

cycle.get("/:id", async (c)=>{
    const id = Number(c.req.param("id"))
    const prisma = getPrismaClient(c.env)
    if (!Number.isFinite(id) || id <= 0) {
        return c.json({ message: "Invalid mesocycle id" }, 400)
    }

    const mesocycleRow = await prisma.mesocycle.findFirst({
        where: {
            id,
            deletedAt: null,
        },
        select: {
            id: true,
            name: true,
        },
    })

    if (!mesocycleRow) {
        return c.json({ message: "Mesocycle not found" }, 404)
    }

    const weekRows = await prisma.week.findMany({
        where:{
            mesocycleId:id,
            deletedAt: null,
        },
        select: {
            id: true,
            week_name: true,
            mesocycleId: true,
        },
        orderBy: {
            id: "asc",
        },
    });
    const weekIds = weekRows.map((week) => week.id)
    const formattedtotalSession = weekIds.length
        ? await prisma.session.count({
              where: {
                  weekId: {
                      in: weekIds,
                  },
                  deletedAt: null,
              },
          })
        : 0

    const weekname = await Promise.all(
        weekRows.map(async (week) => {
            const startingVolumeCount = await prisma.startingVolume.count({
                where: {
                    weekId: week.id,
                    deletedAt: null,
                },
            });

            return {
                id: week.id,
                week_name: week.week_name,
                mesocycleId: week.mesocycleId,
                unlocked: isWeekUnlocked(week.week_name, startingVolumeCount),
                startingVolumeCount,
            };
        })
    );
    const result = {
        "name": mesocycleRow,
        "weekname": weekname,
        "totalsession":formattedtotalSession ,
        }
    console.log("result", result)
    return c.json({
        result: result
    })
    
})

cycle.delete("/:id", async (c) => {
    const prisma = getPrismaClient(c.env)
    const id = Number(c.req.param("id"))

    if (!Number.isFinite(id) || id <= 0) {
        return c.json({ message: "Invalid mesocycle id" }, 400)
    }

    try {
        const result = await softDeleteMesocycle(prisma, id)
        return c.json(
            {
                message: "Mesocycle soft deleted successfully",
                result,
            },
            200
        )
    } catch (error) {
        const knownError = error as Error
        if (knownError.message === "MESOCYCLE_NOT_FOUND") {
            return c.json({ message: "Mesocycle not found" }, 404)
        }
        return c.json(
            {
                message: "Failed to soft delete mesocycle",
                error: knownError.message,
            },
            500
        )
    }
})


export default cycle;
