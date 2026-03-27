import { PrismaTransaction, ExerciseData } from "./types";
import { getMuscleId, upsertExercise } from "./exerciseService";
import { upsertExerciseLog } from "./setService";
import { saveMuscleFeedback } from "./feedbackService";

export async function processExercise(
  tx: PrismaTransaction,
  sessionId: number,
  exercise: ExerciseData
): Promise<void> {
  // 1. Get muscle ID
  const muscleId = await getMuscleId(tx, exercise.muscletrained);

  // 2. Upsert exercise
  const exerciseRecord = await upsertExercise(tx, exercise.exercise_name, muscleId);

  // 3. Upsert exercise log with sets
  await upsertExerciseLog(tx, sessionId, exerciseRecord.id, exercise.set);

  // 4. Save feedback if present
  await saveMuscleFeedback(tx, sessionId, muscleId, exercise.soreness, exercise.performance);
}


export async function saveSessionExercises(
  tx: PrismaTransaction,
  sessionId: number,
  exercises: ExerciseData[]
): Promise<void> {
  for (const exercise of exercises) {
    await processExercise(tx, sessionId, exercise);
  }
}
