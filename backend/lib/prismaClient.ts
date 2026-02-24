
import { PrismaClient } from "../src/generated/prisma/client.js";
import { withAccelerate } from '@prisma/extension-accelerate'

let prisma: ReturnType<typeof createPrismaClient> | null = null;

function createPrismaClient(DATABASE_URL: string){
    return new PrismaClient({
        accelerateUrl:DATABASE_URL,
    }).$extends(withAccelerate());
}

export const getPrismaClient = (env: any)=>{
    if(prisma){
        return prisma;
    }
    prisma = createPrismaClient(env.DATABASE_URL);
    return prisma 
};


export default getPrismaClient;
