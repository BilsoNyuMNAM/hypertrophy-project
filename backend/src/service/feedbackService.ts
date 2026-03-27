import { PrismaTransaction, SorenessData, PerformanceData } from "./types";
import { extractScore } from "./utils";

/**
 * Looks up soreness feedback record by score
 * Returns the feedback record or null if not found
 */
async function getSorenessFeedback(
  tx: PrismaTransaction,
  score: number
): Promise<{ id: number } | null> {
  return await tx.sorenessfeedback.findFirst({
    where: { soreness_score: score },
  });
}

/**
 * Looks up performance feedback record by score
 * Returns the feedback record or null if not found
 */
async function getPerformanceFeedback(
  tx: PrismaTransaction,
  score: number
): Promise<{ id: number } | null> {
  return await tx.performancefeedback.findFirst({
    where: { performance_score: score },
  });
}

/**
 * Saves muscle feedback (soreness and/or performance) for a session
 * Uses upsert to handle both create and update cases
 */
export async function saveMuscleFeedback(
  tx: PrismaTransaction,
  sessionId: number,
  muscleId: number,
  soreness: SorenessData | null | undefined,
  performance: PerformanceData | null | undefined
): Promise<void> {
  // Skip if no feedback data provided
  if (!soreness && !performance) {
    return;
  }

  const updateData: Record<string, any> = {};
  const createData: Record<string, any> = {
    session: { connect: { id: sessionId } },
    muscle: { connect: { id: muscleId } },
  };

  // Handle soreness feedback
  if (soreness) {
    const score = extractScore(soreness);
    const sorenessLookup = await getSorenessFeedback(tx, score);
    if (sorenessLookup) {
      updateData.sorenessfeedback = { connect: { id: sorenessLookup.id } };
      createData.sorenessfeedback = { connect: { id: sorenessLookup.id } };
    }
  }

  // Handle performance feedback
  if (performance) {
    const score = extractScore(performance);
    const performanceLookup = await getPerformanceFeedback(tx, score);
    if (performanceLookup) {
      updateData.performancefeedback = { connect: { id: performanceLookup.id } };
      createData.performancefeedback = { connect: { id: performanceLookup.id } };
    }
  }

  // Only upsert if we have data to save
  if (Object.keys(updateData).length > 0) {
    await tx.sessionMuscleFeedback.upsert({
      where: {
        sessionId_muscleId: {
          sessionId: sessionId,
          muscleId: muscleId,
        },
      },
      update: updateData,
      create: createData,
    });
  }
}
