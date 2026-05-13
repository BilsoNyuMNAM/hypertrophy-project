import { PrismaTransaction, ExerciseData } from "./types";
import { getMuscleId, upsertExercise } from "./exerciseService";
import { upsertExerciseLog } from "./setService";
import { saveMuscleFeedback } from "./feedbackService";

export type SessionSoftDeleteResult = {
  sessionId: number;
  weekId: number;
  exerciseLogCount: number;
  setCount: number;
  feedbackCount: number;
};

export type SessionWeeklySetSummarySeed = {
  muscleId: number;
  muscleName: string;
  targetSets: number;
  completedSetsOutsideSession: number;
};

export function filterPersistableExercises(
  exercises: ExerciseData[]
): ExerciseData[] {
  return exercises.filter((exercise) => {
    return (
      exercise.exercise_name.trim() !== "" &&
      exercise.muscletrained.trim() !== "" &&
      exercise.set.length > 0
    );
  });
}

export async function processExercise(
  tx: PrismaTransaction,
  sessionId: number,
  exercise: ExerciseData
): Promise<{ exerciseId: number; muscleId: number }> {
  // 1. Get muscle ID
  const muscleId = await getMuscleId(tx, exercise.muscletrained);

  // 2. Upsert exercise
  const exerciseRecord = await upsertExercise(tx, exercise.exercise_name, muscleId);

  // 3. Upsert exercise log with sets
  await upsertExerciseLog(tx, sessionId, exerciseRecord.id, exercise.set);

  // 4. Save feedback if present
  await saveMuscleFeedback(tx, sessionId, muscleId, exercise.soreness, exercise.performance);

  return {
    exerciseId: exerciseRecord.id,
    muscleId,
  };
}

export async function reconcileRemovedSessionData(
  tx: PrismaTransaction,
  sessionId: number,
  desiredExerciseIds: number[],
  desiredMuscleIds: number[]
): Promise<void> {
  const existingExerciseLogs = await tx.exerciselog.findMany({
    where: { sessionId },
    select: {
      id: true,
      exerciseId: true,
    },
  });

  const staleExerciseLogIds = existingExerciseLogs
    .filter(
      (exerciseLog: { exerciseId: number }) =>
        !desiredExerciseIds.includes(exerciseLog.exerciseId)
    )
    .map((exerciseLog: { id: number }) => exerciseLog.id);

  if (staleExerciseLogIds.length > 0) {
    await tx.set.deleteMany({
      where: {
        exerciselogId: { in: staleExerciseLogIds },
      },
    });

    await tx.exerciselog.deleteMany({
      where: {
        id: { in: staleExerciseLogIds },
      },
    });
  }

  if (desiredMuscleIds.length > 0) {
    await tx.sessionMuscleFeedback.deleteMany({
      where: {
        sessionId,
        muscleId: { notIn: desiredMuscleIds },
      },
    });
    return;
  }

  await tx.sessionMuscleFeedback.deleteMany({
    where: {
      sessionId,
    },
  });
}


export async function saveSessionExercises(
  tx: PrismaTransaction,
  sessionId: number,
  exercises: ExerciseData[]
): Promise<void> {
  const persistableExercises = filterPersistableExercises(exercises);
  const desiredExerciseIds: number[] = [];
  const desiredMuscleIds: number[] = [];

  for (const exercise of persistableExercises) {
    const { exerciseId, muscleId } = await processExercise(
      tx,
      sessionId,
      exercise
    );

    desiredExerciseIds.push(exerciseId);
    if (!desiredMuscleIds.includes(muscleId)) {
      desiredMuscleIds.push(muscleId);
    }
  }

  await reconcileRemovedSessionData(
    tx,
    sessionId,
    desiredExerciseIds,
    desiredMuscleIds
  );
}

export async function softDeleteSession(
  prisma: PrismaTransaction,
  sessionId: number
): Promise<SessionSoftDeleteResult> {
  const activeSession = await prisma.session.findFirst({
    where: { id: sessionId, deletedAt: null },
    select: { id: true, weekId: true },
  });

  if (!activeSession) {
    throw new Error("SESSION_NOT_FOUND");
  }

  const now = new Date();

  const counts = await prisma.$transaction(async (tx: PrismaTransaction) => {
    const exerciseLogs = await tx.exerciselog.findMany({
      where: {
        sessionId,
        deletedAt: null,
      },
      select: { id: true },
    });

    const exerciseLogIds = exerciseLogs.map((exerciseLog: { id: number }) => {
      return exerciseLog.id;
    });

    const updatedSets = exerciseLogIds.length
      ? await tx.set.updateMany({
          where: {
            exerciselogId: { in: exerciseLogIds },
            deletedAt: null,
          },
          data: { deletedAt: now },
        })
      : { count: 0 };

    const updatedFeedback = await tx.sessionMuscleFeedback.updateMany({
      where: {
        sessionId,
        deletedAt: null,
      },
      data: { deletedAt: now },
    });

    const updatedExerciseLogs = await tx.exerciselog.updateMany({
      where: {
        sessionId,
        deletedAt: null,
      },
      data: { deletedAt: now },
    });

    const updatedSession = await tx.session.updateMany({
      where: {
        id: sessionId,
        deletedAt: null,
      },
      data: { deletedAt: now },
    });

    if (updatedSession.count === 0) {
      throw new Error("SESSION_NOT_FOUND");
    }

    return {
      exerciseLogCount: updatedExerciseLogs.count,
      setCount: updatedSets.count,
      feedbackCount: updatedFeedback.count,
    };
  });

  return {
    sessionId,
    weekId: activeSession.weekId,
    ...counts,
  };
}

export async function getSessionWeeklySetSummarySeed(
  prisma: PrismaTransaction,
  weekId: number,
  sessionId: number
): Promise<SessionWeeklySetSummarySeed[]> {
  const week = await prisma.week.findFirst({
    where: {
      id: weekId,
      deletedAt: null,
    },
    select: {
      id: true,
      startingvolume: {
        where: {
          deletedAt: null,
        },
        select: {
          muscleId: true,
          set: true,
          muscle: {
            select: {
              muscle_name: true,
            },
          },
        },
      },
      session: {
        where: {
          deletedAt: null,
          id: {
            not: sessionId,
          },
        },
        select: {
          exerciselogs: {
            where: {
              deletedAt: null,
            },
            select: {
              exercise: {
                select: {
                  muscleId: true,
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
                  id: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!week) {
    throw new Error("WEEK_NOT_FOUND");
  }

  const completedSetsByMuscle = new Map<
    number,
    { muscleName: string; completedSetsOutsideSession: number }
  >();

  week.session.forEach(
    (session: {
      exerciselogs: {
        exercise: {
          muscleId: number;
          muscle: { muscle_name: string };
        };
        set: { id: number }[];
      }[];
    }) => {
      session.exerciselogs.forEach((exerciseLog) => {
        const current = completedSetsByMuscle.get(exerciseLog.exercise.muscleId);
        completedSetsByMuscle.set(exerciseLog.exercise.muscleId, {
          muscleName: exerciseLog.exercise.muscle.muscle_name,
          completedSetsOutsideSession:
            (current?.completedSetsOutsideSession || 0) + exerciseLog.set.length,
        });
      });
    }
  );

  const summaryRows = week.startingvolume.map(
    (volumeRow: {
      muscleId: number;
      set: number;
      muscle: { muscle_name: string };
    }) => {
      return {
        muscleId: volumeRow.muscleId,
        muscleName: volumeRow.muscle.muscle_name,
        targetSets: volumeRow.set,
        completedSetsOutsideSession:
          completedSetsByMuscle.get(volumeRow.muscleId)
            ?.completedSetsOutsideSession || 0,
      };
    }
  );

  completedSetsByMuscle.forEach((row, muscleId) => {
    const alreadyIncluded = summaryRows.some(
      (summaryRow: SessionWeeklySetSummarySeed) => summaryRow.muscleId === muscleId
    );

    if (!alreadyIncluded) {
      summaryRows.push({
        muscleId,
        muscleName: row.muscleName,
        targetSets: 0,
        completedSetsOutsideSession: row.completedSetsOutsideSession,
      });
    }
  });

  return summaryRows;
}
