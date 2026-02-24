
import {getPrismaClient} from "../../../../../lib/prismaClient";
type PrismaClient = ReturnType<typeof getPrismaClient>;
type volume = {
    "muscle_name": string,
    "set":number
}
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