import { PrismaTransaction, SetData } from "./types";

/**
 * Maps raw set data to database format
 */
function formatSetData(sets: SetData[]) {
  return sets.map((set) => ({
    reps: Number(set.reps),
    weight: Number(set.weight),
    rir: Number(set.rir),
  }));
}

/**
 * Creates or updates exercise log with sets
 * If updating, deletes old sets and creates new ones
 */
export async function upsertExerciseLog(
  tx: PrismaTransaction,
  sessionId: number,
  exerciseId: number,
  sets: SetData[]
): Promise<void> {
  const formattedSets = formatSetData(sets);

  await tx.exerciselog.upsert({
    where: {
      exerciseId_sessionId: {
        exerciseId: exerciseId,
        sessionId: sessionId,
      },
    },
    create: {
      sessionId: sessionId,
      exerciseId: exerciseId,
      set: {
        createMany: {
          data: formattedSets,
        },
      },
    },
    update: {
      set: {
        deleteMany: {},
        createMany: {
          data: formattedSets,
        },
      },
    },
  });
}
