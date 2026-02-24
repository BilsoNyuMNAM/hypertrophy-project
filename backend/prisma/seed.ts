import { PrismaClient } from "../src/generated/prisma-node/client.js";
import {PrismaPg} from "@prisma/adapter-pg";

const adapter = new PrismaPg({connectionString: process.env.DIRECT_URL});
const prisma = new PrismaClient({adapter});

const seedfn = async function seed(){
    await prisma.muscle.createMany({
        data:[
            {muscle_name: "back"},
            {muscle_name: "chest"},
            {muscle_name: "legs"},
            {muscle_name: "biceps"},
            {muscle_name: "triceps"},
            {muscle_name: "forearms"},
            {muscle_name: "abs"},
            {muscle_name: "front delts"},
            {muscle_name: "side delts"},
            {muscle_name: "rear delts"},
            {muscle_name: "glutes"},
            {muscle_name: "calves"},
            {muscle_name: "traps"}
        ]
    })
}
seedfn();
