import {getPrismaClient} from "../../../../lib/prismaClient";
import {Hono} from "hono";
const weekRoute   = new Hono<{ Bindings: { DATABASE_URL: string } }>();
type PrismaClient = ReturnType<typeof getPrismaClient>;


export async function week(prisma:PrismaClient, id:number){
    const weekResult = await prisma.week.createManyAndReturn({
        data:[
            {week_name:"week 1", mesocycleId:id},
            {week_name:"week 2", mesocycleId:id},
            {week_name:"week 3", mesocycleId:id},
            {week_name:"week 4", mesocycleId:id}
        ]
    })
    return weekResult; // this will not gets executed until the await operation is completed 
}

