import { Hono } from "hono";
import { getPrismaClient } from "../../../../lib/prismaClient";
import { saveSessionExercises, SessionPayload } from "../../../service";
import  {completeUpdate} from "../../../service/Completeupdate";
const sessionRoute = new Hono<{ Bindings: { DATABASE_URL: string } }>();

sessionRoute.post("/create/:weeId", async (c) => {
  const body = await c.req.json();
  const prisma = getPrismaClient(c.env);
  const weekId = Number(c.req.param("weeId"));

  const result = await prisma.session.create({
    data: {
      session_name: body.session_name,
      weekId: weekId,
    },
  });
  return c.json(
    {
      message: "Session created successfully",
      result: result,
    },
    201
  );
});

sessionRoute.post("/add/set/:sessionId", async (c) => {
  const prisma = getPrismaClient(c.env);
  const sessionId = Number(c.req.param("sessionId"));
  const body: SessionPayload = await c.req.json();

  try {
    await prisma.$transaction(
      async (tx) => {
        await saveSessionExercises(tx, sessionId, body.sessionData);
      },
      { maxWait: 10000, timeout: 10000 }
    );

    return c.json({
      message: "Session is saved successfully",
    });
  } catch (error) {
    return c.json(
      {
        error: "An error occurred while saving the session data",
        details: error instanceof Error ? error.message : String(error),
      },
      500
    );
  }
});

sessionRoute.get("/all/:weekId", async (c) => {
  const prisma = getPrismaClient(c.env);
  const weekId = Number(c.req.param("weekId"));

  const sessions = {
    sessions: await prisma.session.findMany({
      where: {
        weekId: weekId,
      },
      select: {
        id: true,
        session_name: true,
        exerciselogs: {
          select: {
            id: true,
            exerciseId: true,
            set: {
              select: {
                id: true,
                reps: true,
                weight: true,
                rir: true,
              },
            },
          },
        },
      },
    }),
    weekStatus: await prisma.week.findUnique({
      where: {
        id: weekId,
      },
      select: {
        completed: true,
      },
    }),
  };
  const length = sessions.sessions.length;
  return c.json({
    message: `All the session for weekID ${weekId} is fetched successfully:`,
    result: sessions,
    totalSessions: length,
  });
});

sessionRoute.patch("/booleanUpdate/:weekId", async (c) => {
  const prisma = getPrismaClient(c.env);
  const weekId = Number(c.req.param("weekId"));
  const body = await c.req.json();
  const completed = body.booleanStatus;
  const booleanResult = await completeUpdate(weekId, completed, prisma);
  return c.json(
    {
      message: "boolean update successfull",
      result: booleanResult,
    },
    200
  );
});

sessionRoute.get("/:sessionId", async (c) => {
  const prisma = getPrismaClient(c.env);
  const sessionId = Number(c.req.param("sessionId"));
  const sessions = await prisma.session.findUnique({
    where: {
      id: sessionId,
    },
    select: {
      session_name: true,
      id: true,
      exerciselogs: {
        select: {
          exercise: {
            select: {
              exercise_name: true,
              muscle: {
                select: {
                  muscle_name: true,
                },
              },
            },
          },
          set: {
            select: {
              reps: true,
              weight: true,
              rir: true,
            },
          },
        },
      },
      sessionmusclefeedback: {
        select: {
          muscle: {
            select: {
              muscle_name: true,
            },
          },
          sorenessfeedback: {
            select: {
              soreness_score: true,
              description: true,
            },
          },
          performancefeedback: {
            select: {
              performance_score: true,
              description: true,
            },
          },
        },
      },
    },
  });

  if (sessions === null) {
    return c.json(
      {
        message: "No session found with the specified id",
      },
      404
    );
  }

  // Build a map of muscle_name -> feedback for quick lookup
  const feedbackMap = new Map();
  sessions.sessionmusclefeedback?.forEach((fb) => {
    if (fb.muscle?.muscle_name) {
      feedbackMap.set(fb.muscle.muscle_name, {
        soreness: fb.sorenessfeedback
          ? {
              soreness_score: fb.sorenessfeedback.soreness_score,
              description: fb.sorenessfeedback.description,
            }
          : null,
        performance: fb.performancefeedback
          ? {
              performance_score: fb.performancefeedback.performance_score,
              description: fb.performancefeedback.description,
            }
          : null,
      });
    }
  });

  const eachexercise = sessions.exerciselogs.map((exerciselog) => {
    const exercise_name = exerciselog.exercise.exercise_name;
    const muscletrained = exerciselog.exercise.muscle.muscle_name;
    const set = exerciselog.set;

    // Get feedback for this muscle if it exists
    const feedback = feedbackMap.get(muscletrained);

    return {
      exercise_name,
      muscletrained,
      set,
      ...(feedback?.soreness && { soreness: feedback.soreness }),
      ...(feedback?.performance && { performance: feedback.performance }),
    };
  });

  return c.json({
    message: "Session data with the specified id is being fetched",
    session_name: sessions.session_name,
    eachexercise: eachexercise,
  });
});

export default sessionRoute;
