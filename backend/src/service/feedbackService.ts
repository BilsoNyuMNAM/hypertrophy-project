import { PrismaTransaction, SorenessData, PerformanceData } from "./types";
import { extractScore } from "./utils";
import { savePerformanceRating } from "./performanceRating";

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
 * Saves muscle feedback (soreness and/or performance) for a session
 */
export async function saveMuscleFeedback(
  tx: PrismaTransaction,
  sessionId: number,
  muscleId: number,
  soreness: SorenessData | null | undefined,
  performance: PerformanceData | null | undefined
): Promise<void> {
  if (!soreness && !performance) {
    return;
  }

  // Handle soreness feedback inline
  if (soreness) {
    const updateData: Record<string, any> = {};
    const createData: Record<string, any> = {
      session: { connect: { id: sessionId } },
      muscle: { connect: { id: muscleId } },
    };

    const score = extractScore(soreness);
    const sorenessLookup = await getSorenessFeedback(tx, score);

    if (sorenessLookup) {
      updateData.sorenessfeedback = { connect: { id: sorenessLookup.id } };
      createData.sorenessfeedback = { connect: { id: sorenessLookup.id } };

      await tx.sessionMuscleFeedback.upsert({
        where: {
          sessionId_muscleId: {
            sessionId,
            muscleId,
          },
        },
        update: updateData,
        create: createData,
      });
    }
  }

  // Handle performance feedback via dedicated service module
  if (performance) {
    await savePerformanceRating(tx, sessionId, muscleId, performance);
  }
}
