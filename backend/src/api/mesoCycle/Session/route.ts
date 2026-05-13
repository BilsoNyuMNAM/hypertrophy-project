import { Hono } from "hono";
import { getPrismaClient } from "../../../../lib/prismaClient";
import {
  getSessionWeeklySetSummarySeed,
  saveSessionExercises,
  SessionPayload,
  softDeleteSession,
} from "../../../service";
import  {completeUpdate} from "../../../service/Completeupdate";
const sessionRoute = new Hono<{ Bindings: { DATABASE_URL: string } }>();

sessionRoute.post("/create/:weeId", async (c) => {
  const body = await c.req.json();
  const prisma = getPrismaClient(c.env);
  const weekId = Number(c.req.param("weeId"));

  const activeWeek = await prisma.week.findFirst({
    where: {
      id: weekId,
      deletedAt: null,
    },
    select: {
      id: true,
    },
  });

  if (!activeWeek) {
    return c.json(
      {
        message: "Week not found",
      },
      404
    );
  }

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

  const activeSession = await prisma.session.findFirst({
    where: {
      id: sessionId,
      deletedAt: null,
    },
    select: {
      id: true,
    },
  });

  if (!activeSession) {
    return c.json(
      {
        message: "Session not found",
      },
      404
    );
  }

  try {
    await prisma.$transaction(
      async (tx) => {
        await saveSessionExercises(tx, sessionId, body.sessionData);
      },
      { maxWait: 15000, timeout: 15000 }
    );

    return c.json({
      message: "Session is saved successfully",
    });
  } catch (error) {
    console.log(error)
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
        deletedAt: null,
      },
      select: {
        id: true,
        session_name: true,
        exerciselogs: {
          where: {
            deletedAt: null,
          },
          select: {
            id: true,
            exerciseId: true,
            set: {
              where: {
                deletedAt: null,
              },
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
    weekStatus: await prisma.week.findFirst({
      where: {
        id: weekId,
        deletedAt: null,
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
  try {
    const booleanResult = await completeUpdate(weekId, completed, prisma);
    return c.json(
      {
        message: "boolean update successfull",
        result: booleanResult,
      },
      200
    );
  } catch (error) {
    const knownError = error as Error;
    if (knownError.message === "WEEK_NOT_FOUND") {
      return c.json(
        {
          message: "Week not found",
        },
        404
      );
    }
    return c.json(
      {
        message: "Failed to update week status",
        error: knownError.message,
      },
      500
    );
  }
});

sessionRoute.delete("/:sessionId", async (c) => {
  const prisma = getPrismaClient(c.env);
  const sessionId = Number(c.req.param("sessionId"));

  if (!Number.isFinite(sessionId) || sessionId <= 0) {
    return c.json(
      {
        message: "Invalid session id",
      },
      400
    );
  }

  try {
    const result = await softDeleteSession(prisma, sessionId);
    return c.json(
      {
        message: "Session soft deleted successfully",
        result,
      },
      200
    );
  } catch (error) {
    const knownError = error as Error;

    if (knownError.message === "SESSION_NOT_FOUND") {
      return c.json(
        {
          message: "Session not found",
        },
        404
      );
    }

    return c.json(
      {
        message: "Failed to delete session",
        error: knownError.message,
      },
      500
    );
  }
});

sessionRoute.get("/:sessionId", async (c) => {
  const prisma = getPrismaClient(c.env);
  const sessionId = Number(c.req.param("sessionId"));
  const activeSession = await prisma.session.findFirst({
    where: {
      id: sessionId,
      deletedAt: null,
    },
    select: {
      session_name: true,
      id: true,
      weekId: true,
      exerciselogs: {
        where: {
          deletedAt: null,
        },
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
            where: {
              deletedAt: null,
            },
            select: {
              reps: true,
              weight: true,
              rir: true,
            },
          },
        },
      },
      sessionmusclefeedback: {
        where: {
          deletedAt: null,
        },
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

  if (activeSession === null) {
    return c.json(
      {
        message: "No session found with the specified id",
      },
      404
    );
  }

 
  const feedbackMap = new Map();
  activeSession.sessionmusclefeedback?.forEach((fb) => {
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

  const eachexercise = activeSession.exerciselogs.map((exerciselog) => {
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

  const weeklySetSummarySeed = await getSessionWeeklySetSummarySeed(
    prisma,
    activeSession.weekId,
    sessionId
  );

  return c.json({
    message: "Session data with the specified id is being fetched",
    session_name: activeSession.session_name,
    eachexercise: eachexercise,
    weeklySetSummarySeed,
  });
});

export default sessionRoute;
