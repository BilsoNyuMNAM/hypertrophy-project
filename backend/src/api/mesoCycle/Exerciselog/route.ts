import { Hono } from "hono";
import {getPrismaClient} from "../../../../lib/prismaClient"
const exerciselogRoute = new Hono<{ Bindings: { DATABASE_URL: string } }>();


export async function exerciselog(sessionId:number , exercise_id:number, prisma:any){
    
    const result = await prisma.exerciselog.create({
        data:{
            exerciseId:exercise_id,
            sessionId:sessionId
        }
    })
    return result;
}


