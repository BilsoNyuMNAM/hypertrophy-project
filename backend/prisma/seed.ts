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
        ],
        skipDuplicates: true
    })
}

const sorenessAndperformance = async function sorenessAndperformance(){
    await prisma.sorenessfeedback.createMany({
        data:[
            {
                soreness_score: 1,
                description: "No soreness"
            },
            {
                soreness_score: 2,
                description: "Healed well before session"
            },
            {
                soreness_score: 3,
                description: "Healed just in time "
            },
            {
                soreness_score: 4,
                description: "Still sore from next session"
            }
        ]
    })
    await prisma.performancefeedback.createMany({
        data:[
            {
                performance_score: 1,
                description: "Exceed target easily"
            },
            {
                performance_score: 2,
                description: "Hit targets as planned"
            },
            {
                performance_score: 3,
                description: "Struggled to hit targets"
            },
            {
                performance_score: 4,
                description: "Could not match previous week"
            }
        ]
    })
}
sorenessAndperformance();
seedfn();
