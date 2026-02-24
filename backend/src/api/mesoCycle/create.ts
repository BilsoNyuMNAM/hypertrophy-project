
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
    console.log("frequency result", result)
    const weekResult = await week(prisma, id.id)
    //@ts-ignore
    console.log("week result", weekResult)
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
            _count:{
                select:{
                    week:true
                }
            }
        }
    })
    return c.json({
        message:"Fetched is successfull",
        result: searchResult
    })
})

cycle.get("/:id", async (c)=>{
    const id = c.req.param("id")
    const prisma = getPrismaClient(c.env)
    
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
            })
        }
    console.log("result", result)
    return c.json({
        result: result
    })
    
})


export default cycle;






