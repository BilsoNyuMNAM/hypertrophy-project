import { PrismaTransaction } from "./types";

export type ValidationIssue = {
  code:
    | "WEEK_NOT_FOUND"
    | "NO_SESSIONS"
    | "INCOMPLETE_MUSCLE_VOLUME"
    | "INCOMPLETE_SET"
    | "MISSING_FEEDBACK"
    | "MISSING_FREQUENCY";
  message: string;
  sessionId?: number;
  muscleId?: number;
  muscleName?: string;
  exerciseLogId?: number;
  setId?: number;
};

type SessionFeedbackRow = {
  muscleId: number;
  sorenessfeedbackId: number | null;
  performancefeedbackId: number | null;
  sorenessfeedback: { soreness_score: number } | null;
  performancefeedback: { performance_score: number } | null;
};

type WeekSessionRow = {
  id: number;
  exerciselogs: {
    id: number;
    exercise: {
      muscleId: number;
      muscle: { muscle_name: string };
    };
    set: {
      id: number;
      reps: number;
      weight: number;
      rir: number;
    }[];
  }[];
  sessionmusclefeedback: SessionFeedbackRow[];
};

function parseWeekNumber(weekName: string): number {
  const parsed = Number(weekName.replace(/\D/g, ""));
  return Number.isFinite(parsed) ? parsed : 0;
}

function getScoreDelta(maxScore: number): number {
  if (maxScore === 1) return 2;
  if (maxScore === 2) return 1;
  if (maxScore === 3) return 0;
  if (maxScore === 4) return -2;
  return 0;
}

function calculateNextSetCount(currentSetCount: number, maxScore: number): number {
  return Math.max(0, currentSetCount + getScoreDelta(maxScore));
}

function getSessionMuscles(session: WeekSessionRow): Map<number, string> {
  const sessionMuscles = new Map<number, string>();
  session.exerciselogs.forEach((log) => {
    sessionMuscles.set(log.exercise.muscleId, log.exercise.muscle.muscle_name);
  });
  return sessionMuscles;
}

function buildFeedbackMap(
  feedbackRows: SessionFeedbackRow[]
): Map<number, SessionFeedbackRow> {
  const feedbackMap = new Map<number, SessionFeedbackRow>();
  feedbackRows.forEach((row) => {
    feedbackMap.set(row.muscleId, row);
  });
  return feedbackMap;
}

export async function validateWeekForProgression(
  prisma: PrismaTransaction,
  weekId: number
): Promise<ValidationIssue[]> {
  const week = await prisma.week.findFirst({
    where: { id: weekId, deletedAt: null },
    select: {
      id: true,
      mesocycleId: true,
      session: {
        where: {
          deletedAt: null,
        },
        orderBy: { id: "asc" },
        select: {
          id: true,
          exerciselogs: {
            where: {
              deletedAt: null,
            },
            select: {
              id: true,
              exercise: {
                select: {
                  muscleId: true,
                  muscle: {
                    select: {
                      muscle_name: true,
                    },
                  },
                },
              },
              set: {
                where: {
                  deletedAt: null,
                },
                select: {
                  id: true,
                  reps: true,
                  weight: true,
                  rir: true,
                },
              },
            },
          },
          sessionmusclefeedback: {
            where: {
              deletedAt: null,
            },
            select: {
              muscleId: true,
              sorenessfeedbackId: true,
              performancefeedbackId: true,
              sorenessfeedback: {
                select: {
                  soreness_score: true,
                },
              },
              performancefeedback: {
                select: {
                  performance_score: true,
                },
              },
            },
          },
        },
      },
      startingvolume: {
        where: {
          deletedAt: null,
        },
        select: {
          muscleId: true,
          set: true,
          muscle: {
            select: {
              muscle_name: true,
            },
          },
        },
      },
    },
  });

  if (!week) {
    return [
      {
        code: "WEEK_NOT_FOUND",
        message: `Week ${weekId} was not found`,
      },
    ];
  }

  const issues: ValidationIssue[] = [];

  if (week.session.length === 0) {
    issues.push({
      code: "NO_SESSIONS",
      message: "No sessions found in this week",
    });
    return issues;
  }

  // Planned weekly muscle volume must be fully completed before progression.
  const completedVolumeByMuscle = new Map<number, number>();
  week.session.forEach((session: WeekSessionRow) => {
    session.exerciselogs.forEach((exerciseLog) => {
      const muscleId = exerciseLog.exercise.muscleId;
      const completedSets = exerciseLog.set.length;
      completedVolumeByMuscle.set(
        muscleId,
        (completedVolumeByMuscle.get(muscleId) || 0) + completedSets
      );
    });
  });

  week.startingvolume.forEach(
    (planned: { muscleId: number; set: number; muscle: { muscle_name: string } }) => {
      const completed = completedVolumeByMuscle.get(planned.muscleId) || 0;
      if (completed < planned.set) {
        issues.push({
          code: "INCOMPLETE_MUSCLE_VOLUME",
          muscleId: planned.muscleId,
          muscleName: planned.muscle.muscle_name,
          message: `${planned.muscle.muscle_name} volume is incomplete (${completed}/${planned.set} sets). Complete this first.`,
        });
      }
    }
  );

  // Set completion validation (blank inputs currently persist as 0,0,0)
  week.session.forEach((session: WeekSessionRow) => {
    session.exerciselogs.forEach((exerciseLog) => {
      exerciseLog.set.forEach((setRow) => {
        const hasMissingValues =
          setRow.reps == null || setRow.weight == null || setRow.rir == null;
        const looksLikeBlankEntry =
          setRow.reps === 0 && setRow.weight === 0 && setRow.rir === 0;

        if (hasMissingValues || looksLikeBlankEntry) {
          issues.push({
            code: "INCOMPLETE_SET",
            message: `Session ${session.id} has an incomplete set for ${exerciseLog.exercise.muscle.muscle_name}`,
            sessionId: session.id,
            muscleId: exerciseLog.exercise.muscleId,
            muscleName: exerciseLog.exercise.muscle.muscle_name,
            exerciseLogId: exerciseLog.id,
            setId: setRow.id,
          });
        }
      });
    });
  });

  const frequencyRows = await prisma.frequency.findMany({
    where: { mesocycleId: week.mesocycleId, deletedAt: null },
    select: {
      muscleId: true,
      timesPerWeek: true,
    },
  });

  const frequencyByMuscle = new Map<number, number>();
  frequencyRows.forEach((row: { muscleId: number; timesPerWeek: number }) => {
    frequencyByMuscle.set(row.muscleId, row.timesPerWeek);
  });

  const muscleOccurrence = new Map<number, number>();

  week.session.forEach((session: WeekSessionRow) => {
    const sessionMuscles = getSessionMuscles(session);
    const feedbackMap = buildFeedbackMap(session.sessionmusclefeedback);

    sessionMuscles.forEach((muscleName, muscleId) => {
      const currentOccurrence = (muscleOccurrence.get(muscleId) || 0) + 1;
      muscleOccurrence.set(muscleId, currentOccurrence);

      const configuredFrequency = frequencyByMuscle.get(muscleId);
      if (!configuredFrequency) {
        issues.push({
          code: "MISSING_FREQUENCY",
          message: `Frequency is missing for muscle ${muscleName}`,
          sessionId: session.id,
          muscleId,
          muscleName,
        });
        return;
      }

      const feedbackRequired =
        currentOccurrence > 1 && currentOccurrence <= configuredFrequency;

      if (!feedbackRequired) {
        return;
      }

      const feedbackRow = feedbackMap.get(muscleId);
      const hasSoreness = Boolean(feedbackRow?.sorenessfeedbackId);
      const hasPerformance = Boolean(feedbackRow?.performancefeedbackId);

      if (!hasSoreness || !hasPerformance) {
        issues.push({
          code: "MISSING_FEEDBACK",
          message: `Session ${session.id} is missing required soreness/performance feedback for ${muscleName}`,
          sessionId: session.id,
          muscleId,
          muscleName,
        });
      }
    });
  });

  return issues;
}

export async function calculateNextWeekVolumes(
  prisma: PrismaTransaction,
  weekId: number
): Promise<{ nextWeekId: number; volumes: { muscleId: number; set: number }[] }> {
  const week = await prisma.week.findFirst({
    where: { id: weekId, deletedAt: null },
    select: {
      id: true,
      week_name: true,
      mesocycleId: true,
      session: {
        where: {
          deletedAt: null,
        },
        orderBy: { id: "asc" },
        select: {
          id: true,
          exerciselogs: {
            where: {
              deletedAt: null,
            },
            select: {
              exercise: {
                select: {
                  muscleId: true,
                },
              },
            },
          },
          sessionmusclefeedback: {
            where: {
              deletedAt: null,
            },
            select: {
              muscleId: true,
              sorenessfeedback: {
                select: {
                  soreness_score: true,
                },
              },
              performancefeedback: {
                select: {
                  performance_score: true,
                },
              },
            },
          },
        },
      },
      startingvolume: {
        where: {
          deletedAt: null,
        },
        select: {
          muscleId: true,
          set: true,
        },
      },
    },
  });

  if (!week) {
    throw new Error(`Week ${weekId} not found`);
  }

  const currentWeekNumber = parseWeekNumber(week.week_name);
  const nextWeek = await prisma.week.findFirst({
    where: {
      mesocycleId: week.mesocycleId,
      deletedAt: null,
      week_name: {
        equals: `week ${currentWeekNumber + 1}`,
        mode: "insensitive",
      },
    },
    select: {
      id: true,
    },
  });

  if (!nextWeek) {
    throw new Error("FINAL_WEEK");
  }

  const muscleOccurrence = new Map<number, number>();
  const scoresByMuscle = new Map<number, number[]>();

  week.session.forEach((session: WeekSessionRow) => {
    const sessionMuscleIds = Array.from(
      new Set(session.exerciselogs.map((log) => log.exercise.muscleId))
    );

    const feedbackMap = buildFeedbackMap(session.sessionmusclefeedback);

    sessionMuscleIds.forEach((muscleId) => {
      const occurrence = (muscleOccurrence.get(muscleId) || 0) + 1;
      muscleOccurrence.set(muscleId, occurrence);

      // Session 1 is always excluded for each muscle.
      if (occurrence === 1) {
        return;
      }

      const feedbackRow = feedbackMap.get(muscleId);
      const sorenessScore = feedbackRow?.sorenessfeedback?.soreness_score;
      const performanceScore =
        feedbackRow?.performancefeedback?.performance_score;

      const scorePool = scoresByMuscle.get(muscleId) || [];
      if (typeof sorenessScore === "number") {
        scorePool.push(sorenessScore);
      }
      if (typeof performanceScore === "number") {
        scorePool.push(performanceScore);
      }
      scoresByMuscle.set(muscleId, scorePool);
    });
  });

  const calculatedVolumes = week.startingvolume.map(
    (row: { muscleId: number; set: number }) => {
    const collectedScores = scoresByMuscle.get(row.muscleId) || [];
    // If no score exists for a muscle this week, keep volume unchanged.
    const maxScore = collectedScores.length ? Math.max(...collectedScores) : 3;
    const nextSetCount = calculateNextSetCount(row.set, maxScore);

    return {
      muscleId: row.muscleId,
      set: nextSetCount,
    };
  });

  return {
    nextWeekId: nextWeek.id,
    volumes: calculatedVolumes,
  };
}

export async function calculateAndWriteNextWeekVolumes(
  prisma: PrismaTransaction,
  weekId: number
): Promise<{ nextWeekId: number; volumes: { muscleId: number; set: number }[] }> {
  const validationIssues = await validateWeekForProgression(prisma, weekId);

  if (validationIssues.length > 0) {
    const error = new Error("VALIDATION_FAILED");
    (error as Error & { issues?: ValidationIssue[] }).issues = validationIssues;
    throw error;
  }

  const calculated = await calculateNextWeekVolumes(prisma, weekId);

  await prisma.$transaction(async (tx: PrismaTransaction) => {
    await tx.startingVolume.deleteMany({
      where: {
        weekId: calculated.nextWeekId,
        deletedAt: null,
      },
    });

    if (calculated.volumes.length > 0) {
      await tx.startingVolume.createMany({
        data: calculated.volumes.map((volume) => ({
          weekId: calculated.nextWeekId,
          muscleId: volume.muscleId,
          set: volume.set,
        })),
      });
    }
  });

  return calculated;
}

export type ResetFromWeekResult = {
  mesocycleId: number;
  resetWeekIds: number[];
  deletedStartingVolumes: number;
  deletedSessions: number;
  deletedExerciseLogs: number;
  deletedSets: number;
  deletedFeedbackRows: number;
};

export async function resetMesocycleFromWeek(
  prisma: PrismaTransaction,
  weekId: number
): Promise<ResetFromWeekResult> {
  const targetWeek = await prisma.week.findFirst({
    where: {
      id: weekId,
      deletedAt: null,
    },
    select: {
      id: true,
      mesocycleId: true,
      week_name: true,
    },
  });

  if (!targetWeek) {
    throw new Error("WEEK_NOT_FOUND");
  }

  const targetWeekNumber = parseWeekNumber(targetWeek.week_name);
  if (targetWeekNumber === 1) {
    throw new Error("WEEK_ONE_RESET_NOT_ALLOWED");
  }

  const allWeeksInMeso = await prisma.week.findMany({
    where: {
      mesocycleId: targetWeek.mesocycleId,
      deletedAt: null,
    },
    select: {
      id: true,
      week_name: true,
    },
  });

  const resetWeekIds = allWeeksInMeso
    .filter((week: { id: number; week_name: string }) => {
      return parseWeekNumber(week.week_name) >= targetWeekNumber;
    })
    .map((week: { id: number }) => week.id);

  const result = await prisma.$transaction(async (tx: PrismaTransaction) => {
    const sessionsToDelete = await tx.session.findMany({
      where: {
        weekId: {
          in: resetWeekIds,
        },
        deletedAt: null,
      },
      select: {
        id: true,
      },
    });

    const sessionIds = sessionsToDelete.map((session: { id: number }) => session.id);

    const exerciseLogsToDelete = sessionIds.length
      ? await tx.exerciselog.findMany({
          where: {
            sessionId: {
              in: sessionIds,
            },
            deletedAt: null,
          },
          select: {
            id: true,
          },
        })
      : [];

    const exerciseLogIds = exerciseLogsToDelete.map(
      (exerciseLog: { id: number }) => exerciseLog.id
    );

    const deletedSets = exerciseLogIds.length
      ? await tx.set.deleteMany({
          where: {
            exerciselogId: {
              in: exerciseLogIds,
            },
          },
        })
      : { count: 0 };

    const deletedFeedbackRows = sessionIds.length
      ? await tx.sessionMuscleFeedback.deleteMany({
          where: {
            sessionId: {
              in: sessionIds,
            },
          },
        })
      : { count: 0 };

    const deletedExerciseLogs = sessionIds.length
      ? await tx.exerciselog.deleteMany({
          where: {
            sessionId: {
              in: sessionIds,
            },
          },
        })
      : { count: 0 };

    const deletedSessions = sessionIds.length
      ? await tx.session.deleteMany({
          where: {
            id: {
              in: sessionIds,
            },
          },
        })
      : { count: 0 };

    const deletedStartingVolumes = await tx.startingVolume.deleteMany({
      where: {
        weekId: {
          in: resetWeekIds,
        },
        deletedAt: null,
      },
    });

    return {
      deletedStartingVolumes: deletedStartingVolumes.count,
      deletedSessions: deletedSessions.count,
      deletedExerciseLogs: deletedExerciseLogs.count,
      deletedSets: deletedSets.count,
      deletedFeedbackRows: deletedFeedbackRows.count,
    };
  });

  return {
    mesocycleId: targetWeek.mesocycleId,
    resetWeekIds,
    ...result,
  };
}
