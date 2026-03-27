import { PrismaTransaction, ExerciseData } from "./types";
import { getMuscleId, upsertExercise } from "./exerciseService";
import { upsertExerciseLog } from "./setService";
import { saveMuscleFeedback } from "./feedbackService";

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
