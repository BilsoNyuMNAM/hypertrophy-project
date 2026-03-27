// Utility functions for session operations

/**
 * Trims whitespace from start and end of string
 * Replaces the custom Spaceremover function with native trim
 */
export function normalizeExerciseName(exerciseName: string): string {
  return exerciseName.trim().toLowerCase();
}

/**
 * Extracts score from soreness or performance data
 * Handles both score and soreness_score/performance_score field names
 */
export function extractScore(data: { score?: number; soreness_score?: number; performance_score?: number } | null | undefined): number {
  if (!data) return 0;
  return Number(data.soreness_score || data.performance_score || data.score || 0);
}
