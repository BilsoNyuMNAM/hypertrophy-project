
import { Hono } from "hono";
import { getPrismaClient } from "../../../lib/prismaClient";
import { frequency } from "./Frequency/frequency";
import {week} from "./Week/week";
import {volume} from "./Week/Volume/volume";
const cycle = new Hono<{ Bindings: { DATABASE_URL: string } }>();

//api/v1/mesoCycle/create
cycle.post("/create", async (c) => {
    const prisma = getPrismaClient(c.env)
    const body = await c.req.json();
    
    const name = body.name;//get the meso_cycle name 
    const id = await prisma.mesocycle.create({
        data:{
            name:name
        }
    })
    
    // //delegate other info to their repective routes/ folder 
    const result = await frequency(body.frequencies, id.id, prisma)
    // console.log("frequency result", result)
    const weekResult = await week(prisma, id.id)
    //@ts-ignore
    // console.log("week result", weekResult)
    //@ts-ignore
    const volumeResult = await volume(prisma, weekResult[0].id, body.volume);
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
    const searchResult = await prisma.mesocycle.findMany({
        select:{
            id:true,
            name:true,
            week: {
                select: {
                    week_name: true,
                    completed: true,
                    _count: {
                        select: {
                            session: true,
                        }
                    }
                }
                
            },
            _count:{
                select:{
                    week:true
                }
            }
        }
    })
    
    
    //getting the total session count for the each mesocycle
    // const session = searchResult.map((result)=>{
    //     return result.week.map(week=>{
    //         return week._count.session
    //     })
    // })
    // let totalsession = session.map(eachMesocycle=>{
    //     let totalSession = 0;
    //     eachMesocycle.map(week=>{
    //         totalSession+= week
    //     })
    //     return totalSession
        
    // })
    
    // //getting the number of weeks that is completed for each mesocycle 
    // let weekCompletion = searchResult.map((result)=>{
    //     let count = 0;
    //      result.week.map(week=>{
    //         week.completed === true ? count++: null
    //     })
    //     return count;
    // })
    const formattedResult = searchResult.map((result) => {
        const total_session = result.week.reduce((sum, week) => {
            return sum + week._count.session;
        }, 0);

        const completed = result.week.filter((week) => week.completed === true).length;
        //filter((week) => week.completed === true) : return an array with true value only 
        //.length : gives the number of true value 
        return {
            id: result.id,
            name: result.name,
            completed,
            total_session,
            _count: result._count,
        };
    });

    // console.log("weekCompletion", weekCompletion)
    return c.json({
        message:"Fetched is successfull",
        data: formattedResult
    })
    
})

cycle.get("/:id", async (c)=>{
    const id = c.req.param("id")
    const prisma = getPrismaClient(c.env)
    const rawtotalSession =  await prisma.week.findMany({
        where: { mesocycleId: Number(id) },
        select: {
            _count: { select: { session: true } }
        }
    });
    const formattedtotalSession = rawtotalSession.reduce((sum, week) => {
        return sum + week._count.session;
    }, 0);
    const result = {
        "name":await prisma.mesocycle.findUnique({
                where:{
                    id:Number(id)
                },
        }),
        
        "weekname": await prisma.week.findMany({
                where:{
                    mesocycleId:Number(id)
                }
            }),
        "totalsession":formattedtotalSession ,
        
        
        }
    console.log("result", result)
    return c.json({
        result: result
    })
    
})


export default cycle;






