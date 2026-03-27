export type SessionSetDraft = {
  id: number;
  reps: string | number;
  weight: string | number;
  rir: string | number;
};

export type SessionExerciseDraft = {
  id: number;
  exercise_name: string;
  muscletrained: string;
  set: SessionSetDraft[];
  soreness?: unknown;
  performance?: unknown;
};

function reindexSets(sets: SessionSetDraft[]): SessionSetDraft[] {
  return sets.map((set, index) => ({
    ...set,
    id: index + 1,
  }));
}

function reindexExercises(
  exercises: SessionExerciseDraft[]
): SessionExerciseDraft[] {
  return exercises.map((exercise, index) => ({
    ...exercise,
    id: index + 1,
    set: reindexSets(exercise.set),
  }));
}

export function getPersistableExercises(
  exercises: SessionExerciseDraft[]
): SessionExerciseDraft[] {
  return exercises.filter((exercise) => {
    return (
      exercise.exercise_name.trim() !== "" &&
      exercise.muscletrained.trim() !== "" &&
      exercise.set.length > 0
    );
  });
}

export function deleteSetFromExercises(
  exercises: SessionExerciseDraft[],
  exerciseId: number,
  setId: number
): SessionExerciseDraft[] {
  return reindexExercises(
    exercises.map((exercise) => {
      if (exercise.id !== exerciseId) {
        return exercise;
      }

      return {
        ...exercise,
        set: reindexSets(exercise.set.filter((set) => set.id !== setId)),
      };
    })
  );
}

export function deleteExerciseFromExercises(
  exercises: SessionExerciseDraft[],
  exerciseId: number
): SessionExerciseDraft[] {
  return reindexExercises(
    exercises.filter((exercise) => exercise.id !== exerciseId)
  );
}
