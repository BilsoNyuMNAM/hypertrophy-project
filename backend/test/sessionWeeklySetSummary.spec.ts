import { describe, expect, it, vi } from "vitest";
import { getSessionWeeklySetSummarySeed } from "../src/service/sessionService";

describe("getSessionWeeklySetSummarySeed", () => {
  it("returns weekly target rows with completed sets from other sessions only", async () => {
    const prisma = {
      week: {
        findFirst: vi.fn().mockResolvedValue({
          id: 4,
          startingvolume: [
            {
              muscleId: 1,
              set: 12,
              muscle: {
                muscle_name: "chest",
              },
            },
            {
              muscleId: 2,
              set: 10,
              muscle: {
                muscle_name: "back",
              },
            },
          ],
          session: [
            {
              exerciselogs: [
                {
                  exercise: {
                    muscleId: 1,
                    muscle: {
                      muscle_name: "chest",
                    },
                  },
                  set: [{ id: 1 }, { id: 2 }],
                },
                {
                  exercise: {
                    muscleId: 2,
                    muscle: {
                      muscle_name: "back",
                    },
                  },
                  set: [{ id: 3 }],
                },
              ],
            },
            {
              exerciselogs: [
                {
                  exercise: {
                    muscleId: 1,
                    muscle: {
                      muscle_name: "chest",
                    },
                  },
                  set: [{ id: 4 }],
                },
              ],
            },
          ],
        }),
      },
    };

    const result = await getSessionWeeklySetSummarySeed(prisma, 4, 99);

    expect(prisma.week.findFirst).toHaveBeenCalledWith({
      where: {
        id: 4,
        deletedAt: null,
      },
      select: {
        id: true,
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
        session: {
          where: {
            deletedAt: null,
            id: {
              not: 99,
            },
          },
          select: {
            exerciselogs: {
              where: {
                deletedAt: null,
              },
              select: {
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
                  },
                },
              },
            },
          },
        },
      },
    });
    expect(result).toEqual([
      {
        muscleId: 1,
        muscleName: "chest",
        targetSets: 12,
        completedSetsOutsideSession: 3,
      },
      {
        muscleId: 2,
        muscleName: "back",
        targetSets: 10,
        completedSetsOutsideSession: 1,
      },
    ]);
  });

  it("throws when the week does not exist", async () => {
    const prisma = {
      week: {
        findFirst: vi.fn().mockResolvedValue(null),
      },
    };

    await expect(getSessionWeeklySetSummarySeed(prisma, 8, 9)).rejects.toThrow(
      "WEEK_NOT_FOUND"
    );
  });
});
