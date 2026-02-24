import { getPrismaClient } from "../../../../lib/prismaClient";

  type PrismaClient = ReturnType<typeof getPrismaClient>;

type Frequency = {
    muscle_name: string,
    timesPerWeek: number
}

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