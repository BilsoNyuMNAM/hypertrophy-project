import { PrismaTransaction } from "./types";
import { normalizeExerciseName } from "./utils";


export async function getMuscleId(
  tx: PrismaTransaction,
  muscleName: string
): Promise<number> {
  const muscleRecord = await tx.muscle.findUnique({
    where: { muscle_name: muscleName },
    select: { id: true },
  });

  if (!muscleRecord?.id) {
    throw new Error(`Muscle not found: ${muscleName}`);
  }

  return muscleRecord.id;
}


export async function upsertExercise(
  tx: PrismaTransaction,
  exerciseName: string,
  muscleId: number
): Promise<{ id: number }> {
  const normalizedName = normalizeExerciseName(exerciseName);

  const exerciseRecord = await tx.exercise.upsert({
    where: { exercise_name: normalizedName },
    update: {},
    create: {
      exercise_name: normalizedName,
      muscleId: muscleId,
    },
  });

  return exerciseRecord;
}
