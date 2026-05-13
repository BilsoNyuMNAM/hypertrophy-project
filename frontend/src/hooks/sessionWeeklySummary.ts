import type { SessionExerciseDraft } from "./sessionDraft";

export type SessionWeeklySetSummarySeed = {
  muscleId: number;
  muscleName: string;
  targetSets: number;
  completedSetsOutsideSession: number;
};

export type SessionWeeklySetSummaryRow = {
  muscleName: string;
  targetSets: number;
  completedSetsOutsideSession: number;
  currentSessionSets: number;
  completedSets: number;
  setsLeft: number;
};

function normalizeMuscleName(muscleName: string): string {
  return muscleName.trim().toLowerCase();
}

export function buildSessionWeeklySetSummary(
  summarySeed: SessionWeeklySetSummarySeed[],
  exercises: SessionExerciseDraft[]
): SessionWeeklySetSummaryRow[] {
  const summarySeedByMuscle = new Map<string, SessionWeeklySetSummarySeed>();
  summarySeed.forEach((row) => {
    summarySeedByMuscle.set(normalizeMuscleName(row.muscleName), row);
  });

  const currentSessionSetsByMuscle = new Map<string, number>();
  const draftMuscleLabels = new Map<string, string>();
  const muscleOrder: string[] = [];

  exercises.forEach((exercise) => {
    const trimmedMuscle = exercise.muscletrained.trim();
    if (trimmedMuscle === "") {
      return;
    }

    const muscleKey = normalizeMuscleName(trimmedMuscle);
    if (!draftMuscleLabels.has(muscleKey)) {
      draftMuscleLabels.set(muscleKey, trimmedMuscle);
      muscleOrder.push(muscleKey);
    }

    currentSessionSetsByMuscle.set(
      muscleKey,
      (currentSessionSetsByMuscle.get(muscleKey) || 0) + exercise.set.length
    );
  });

  return muscleOrder.map((muscleKey) => {
    const seedRow = summarySeedByMuscle.get(muscleKey);
    const targetSets = seedRow?.targetSets || 0;
    const completedSetsOutsideSession =
      seedRow?.completedSetsOutsideSession || 0;
    const currentSessionSets = currentSessionSetsByMuscle.get(muscleKey) || 0;
    const completedSets = completedSetsOutsideSession + currentSessionSets;

    return {
      muscleName:draftMuscleLabels.get(muscleKey) || seedRow?.muscleName || muscleKey,
      targetSets,
      completedSetsOutsideSession,
      currentSessionSets,
      completedSets,
      setsLeft: Math.max(targetSets - completedSets, 0),
    };
  });
}
