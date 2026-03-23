import { Hono } from "hono";
import { getPrismaClient } from "../../../../lib/prismaClient";
import { Result } from "pg";

const sessionRoute = new Hono<{ Bindings: { DATABASE_URL: string } }>();

async function Spaceremover(exercise_name:string){
    let variable = exercise_name
    let start = 0;
    let end = variable.length-1
    while(variable[start]===" "){
        start++;
    }
    while(variable[end]===" "){
        end--;
    }
    let result=""
    for(let i=start; i<=end; i++){
        result += variable[i]
    }   

    return result;
}

sessionRoute.post("/create/:weeId", async (c)=>{
    const body = await c.req.json();
    const prisma = getPrismaClient(c.env)
    const weekId = Number(c.req.param("weeId"))
   
    const result = await prisma.session.create({
        data:{
            session_name : body.session_name,
            weekId:weekId
        }
    })
    return c.json({
        message:"Session created successfully",
        result: result
    },201)
})

type set = {reps:number, weight:number, rir:number}

sessionRoute.post("/add/set/:sessionId", async (c)=>{
    const prisma = getPrismaClient(c.env)
    const sessionId = Number(c.req.param("sessionId"))
    console.log("session id is ", sessionId);
    const body = await c.req.json(); //{"sessionData":[{}, {}, {}]}
    const sessionData = body.sessionData
    
    try{
        const result = await prisma.$transaction(async (tx) => {   
            for (const exercise of sessionData) {            
                // Resolve muscleId first so we can reuse it for feedback
                const muscleRecord = await tx.muscle.findUnique({
                    where:{
                        muscle_name: exercise.muscletrained
                    },
                    select:{
                        id:true
                    }
                });
                const muscleId = muscleRecord?.id;

                if (!muscleId) {
                    throw new Error(`Muscle not found for exercise: ${exercise.exercise_name}`);
                }

                //1. Query 1 
                const exerciseRecord = await tx.exercise.upsert({
                    where:  { 
                        //@ts-ignore
                        exercise_name:(await Spaceremover(exercise.exercise_name)).toLocaleLowerCase()
                    },
                    update: {},
                    //@ts-ignore
                    create: {
                        exercise_name: (await Spaceremover(exercise.exercise_name)).toLocaleLowerCase(),
                        muscleId: muscleId
                    } 
                });
                

                //2. Query 2       
                await tx.exerciselog.upsert({
                    where: {
                        exerciseId_sessionId: {
                            exerciseId: exerciseRecord.id,  
                            sessionId: sessionId,
                        }
                    },
                    create: {
                        sessionId: sessionId,
                        exerciseId: exerciseRecord.id,
                        set: {
                        createMany: { 
                            data: exercise.set.map( (set: any) => { //final ===> data: [{}, {}. {}]
                                return{
                                    reps: Number(set.reps),
                                    weight: Number(set.weight),
                                    rir:Number(set.rir)   
                                }
                            })
                        }
                        }
                    },
                    update: {
                        set: {
                        deleteMany: {},  // wipe old sets first
                        createMany: {
                            data: exercise.set.map( (set: any) => {
                                return{
                                     reps: Number(set.reps),
                                    weight: Number(set.weight),
                                    rir:Number(set.rir) 
                                }
                            })
                        }
                        }
                    }
                });

                // 3 & 4. Soreness & Performance Feedback
                if ((exercise.soreness || exercise.performance) && muscleId) {
                    const updateData: any = {};
                    const createData: any = {
                        session: { connect: { id: sessionId } },
                        muscle: { connect: { id: muscleId } },
                    };

                    if (exercise.soreness) {
                        const score = Number(exercise.soreness.soreness_score || exercise.soreness.score || 0);
                        const sorenessLookup = await tx.sorenessfeedback.findFirst({
                            where: { soreness_score: score }
                        });
                        if (sorenessLookup) {
                            updateData.sorenessfeedback = { connect: { id: sorenessLookup.id } };
                            createData.sorenessfeedback = { connect: { id: sorenessLookup.id } };
                        }
                    }

                    if (exercise.performance) {
                        const score = Number(exercise.performance.performance_score || exercise.performance.score || 0);
                        const performanceLookup = await tx.performancefeedback.findFirst({
                            where: { performance_score: score }
                        });
                        if (performanceLookup) {
                            updateData.performancefeedback = { connect: { id: performanceLookup.id } };
                            createData.performancefeedback = { connect: { id: performanceLookup.id } };
                        }
                    }

                    if (Object.keys(updateData).length > 0) {
                        await tx.sessionMuscleFeedback.upsert({
                            where: {
                                sessionId_muscleId: {
                                    sessionId: sessionId,
                                    muscleId: muscleId
                                }
                            },
                            update: updateData,
                            create: createData
                        });
                    }
                }
            }  
        }, { maxWait: 10000, timeout: 10000 });
        return c.json({
            message:"Session is saved successfully"
        })
    }catch(error){
        console.error("DEBUG INTERNAL ERROR:", error);
        return c.json({
            error:"An error occured while saving the session data",
            details: error instanceof Error ? error.message : String(error)
        },500
    )
    }

})

sessionRoute.get("/all/:weekId", async (c)=>{
    const prisma = getPrismaClient(c.env)
    const weekId = Number(c.req.param("weekId"))
    
    const sessions = {
        "sessions": await prisma.session.findMany({
            where:{
                weekId:weekId,
            
            },
            select:{
                id:true,
                session_name: true,
                
                exerciselogs:{
                    select:{
                        id:true,
                        exerciseId:true,
                        set:{
                            select:{
                                id:true,
                                reps:true,
                                weight:true,
                                rir:true
                            }
                        }
                    }
                    
                }
            } 
        }),
        "weekStatus": await prisma.week.findUnique({
            where:{
                id:weekId
            },
            select:{
                completed:true
            }
        })
    }
    const length = sessions.sessions.length
    return c.json({
        message:`All the session for weekID ${weekId} is fetched successfully:`,
        result: sessions,
        totalSessions:length
    })
})

sessionRoute.patch("/booleanUpdate/:weekId", async (c)=>{
    const prisma = getPrismaClient(c.env)
    const weekId = Number(c.req.param("weekId"))
    const body = await c.req.json(); 
    const completed = body.booleanStatus
    const booleanResult = await prisma.week.update({
        where:{
            id:weekId
        },
        data:{
            completed:completed
        }
    });
    return c.json({
        message:"boolean update successfull",
        result: booleanResult
    },200)
})

sessionRoute.get("/:sessionId", async (c)=>{
    const prisma = getPrismaClient(c.env)
    const sessionId = Number(c.req.param("sessionId"))
    const sessions = await prisma.session.findUnique({
        where:{
            
            id:sessionId
        },
        select:{
            session_name:true,
            id:true,
            exerciselogs:{
                select:{
                    exercise:{
                        select:{
                            exercise_name: true,
                            muscle:{
                                select:{
                                    muscle_name:true
                                }
                            }
                        }
                    },
                    set:{
                        select:{
                            reps:true,
                            weight:true,
                            rir:true    
                        }
                    }
                }
            },
            sessionmusclefeedback:{
                select:{
                    muscle:{
                        select:{
                            muscle_name:true
                        }
                    },
                    sorenessfeedback:{
                        select:{
                            soreness_score:true,
                            description:true
                        }
                    },
                    performancefeedback:{
                        select:{
                            performance_score:true,
                            description:true
                        }
                    }
                }
            }
        }
    })
    
    if(sessions === null){
        return c.json({
            message:"No session found with the specified id",
        },404)
    }
    
    // Build a map of muscle_name -> feedback for quick lookup
    const feedbackMap = new Map();
    sessions.sessionmusclefeedback?.forEach(fb => {
        if (fb.muscle?.muscle_name) {
            feedbackMap.set(fb.muscle.muscle_name, {
                soreness: fb.sorenessfeedback ? {
                    soreness_score: fb.sorenessfeedback.soreness_score,
                    description: fb.sorenessfeedback.description
                } : null,
                performance: fb.performancefeedback ? {
                    performance_score: fb.performancefeedback.performance_score,
                    description: fb.performancefeedback.description
                } : null
            });
        }
    });

    const eachexercise = sessions.exerciselogs.map(exerciselog=>{
            const exercise_name = exerciselog.exercise.exercise_name
            const muscletrained = exerciselog.exercise.muscle.muscle_name
            const set = exerciselog.set
            
            // Get feedback for this muscle if it exists
            const feedback = feedbackMap.get(muscletrained);
            
            return {
                exercise_name,
                muscletrained,
                set,
                ...(feedback?.soreness && { soreness: feedback.soreness }),
                ...(feedback?.performance && { performance: feedback.performance })
            }
        })

    return c.json({
        message:"Session data with the specified id is being fetched",
        session_name: sessions.session_name,
        eachexercise: eachexercise,
        
    })
})

export default sessionRoute;