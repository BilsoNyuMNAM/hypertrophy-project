import { PrismaTransaction, PerformanceData } from "./types";
import { extractScore } from "./utils";

type LookupRecord = { id: number } | null;

async function getPerformanceLookupByScore(
  tx: PrismaTransaction,
  score: number
): Promise<LookupRecord> {
  return tx.performancefeedback.findFirst({
    where: { performance_score: score },
    select: { id: true },
  });
}

export async function savePerformanceRating(
  tx: PrismaTransaction,
  sessionId: number,
  muscleId: number,
  performance: PerformanceData | null | undefined
): Promise<void> {
  if (!performance) return;

  const score = extractScore(performance);
  if (!score) return;

  const performanceLookup = await getPerformanceLookupByScore(tx, score);
  if (!performanceLookup) return;

  await tx.sessionMuscleFeedback.upsert({
    where: {
      sessionId_muscleId: {
        sessionId,
        muscleId,
      },
    },
    update: {
      performancefeedback: {
        connect: { id: performanceLookup.id },
      },
    },
    create: {
      session: { connect: { id: sessionId } },
      muscle: { connect: { id: muscleId } },
      performancefeedback: {
        connect: { id: performanceLookup.id },
      },
    },
  });
}
