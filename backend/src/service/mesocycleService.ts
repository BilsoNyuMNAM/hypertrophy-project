type SoftDeleteCounts = {
  weekCount: number;
  sessionCount: number;
  exerciseLogCount: number;
  setCount: number;
  feedbackCount: number;
  startingVolumeCount: number;
  frequencyCount: number;
};

export type SoftDeleteMesocycleResult = SoftDeleteCounts & {
  mesocycleId: number;
};

export async function softDeleteMesocycle(
  prisma: any,
  mesocycleId: number
): Promise<SoftDeleteMesocycleResult> {
  const mesocycle = await prisma.mesocycle.findFirst({
    where: { id: mesocycleId, deletedAt: null },
    select: { id: true, name: true },
  });

  if (!mesocycle) {
    throw new Error("MESOCYCLE_NOT_FOUND");
  }

  const now = new Date();

  const counts = await prisma.$transaction(async (tx: any) => {
    const weeks = await tx.week.findMany({
      where: { mesocycleId, deletedAt: null },
      select: { id: true },
    });
    const weekIds = weeks.map((week: { id: number }) => week.id);

    const sessions = weekIds.length
      ? await tx.session.findMany({
          where: {
            weekId: { in: weekIds },
            deletedAt: null,
          },
          select: { id: true },
        })
      : [];
    const sessionIds = sessions.map((session: { id: number }) => session.id);

    const exerciseLogs = sessionIds.length
      ? await tx.exerciselog.findMany({
          where: {
            sessionId: { in: sessionIds },
            deletedAt: null,
          },
          select: { id: true },
        })
      : [];
    const exerciseLogIds = exerciseLogs.map((log: { id: number }) => log.id);

    const updatedSets = exerciseLogIds.length
      ? await tx.set.updateMany({
          where: {
            exerciselogId: { in: exerciseLogIds },
            deletedAt: null,
          },
          data: { deletedAt: now },
        })
      : { count: 0 };

    const updatedFeedback = sessionIds.length
      ? await tx.sessionMuscleFeedback.updateMany({
          where: {
            sessionId: { in: sessionIds },
            deletedAt: null,
          },
          data: { deletedAt: now },
        })
      : { count: 0 };

    const updatedExerciseLogs = sessionIds.length
      ? await tx.exerciselog.updateMany({
          where: {
            sessionId: { in: sessionIds },
            deletedAt: null,
          },
          data: { deletedAt: now },
        })
      : { count: 0 };

    const updatedSessions = weekIds.length
      ? await tx.session.updateMany({
          where: {
            weekId: { in: weekIds },
            deletedAt: null,
          },
          data: { deletedAt: now },
        })
      : { count: 0 };

    const updatedStartingVolume = weekIds.length
      ? await tx.startingVolume.updateMany({
          where: {
            weekId: { in: weekIds },
            deletedAt: null,
          },
          data: { deletedAt: now },
        })
      : { count: 0 };

    const updatedFrequencies = await tx.frequency.updateMany({
      where: {
        mesocycleId,
        deletedAt: null,
      },
      data: { deletedAt: now },
    });

    const updatedWeeks = await tx.week.updateMany({
      where: {
        mesocycleId,
        deletedAt: null,
      },
      data: { deletedAt: now },
    });

    const updatedMesocycle = await tx.mesocycle.updateMany({
      where: { id: mesocycleId, deletedAt: null },
      data: { deletedAt: now },
    });

    if (updatedMesocycle.count === 0) {
      throw new Error("MESOCYCLE_NOT_FOUND");
    }

    return {
      weekCount: updatedWeeks.count,
      sessionCount: updatedSessions.count,
      exerciseLogCount: updatedExerciseLogs.count,
      setCount: updatedSets.count,
      feedbackCount: updatedFeedback.count,
      startingVolumeCount: updatedStartingVolume.count,
      frequencyCount: updatedFrequencies.count,
    };
  });

  return {
    mesocycleId,
    ...counts,
  };
}
