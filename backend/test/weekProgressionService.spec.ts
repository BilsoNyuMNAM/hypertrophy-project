import { describe, expect, it, vi } from "vitest";
import {
  calculateNextWeekVolumes,
  resetMesocycleFromWeek,
  validateWeekForProgression,
} from "../src/service/weekProgressionService";

describe("calculateNextWeekVolumes", () => {
  it("uses max soreness/performance score after excluding first session per muscle", async () => {
    const prisma = {
      week: {
        findFirst: vi
          .fn()
          .mockResolvedValueOnce({
            id: 1,
            week_name: "week 1",
            mesocycleId: 7,
            session: [
              {
                id: 101,
                exerciselogs: [
                  { exercise: { muscleId: 1 } },
                  { exercise: { muscleId: 2 } },
                ],
                sessionmusclefeedback: [
                  {
                    muscleId: 1,
                    sorenessfeedback: { soreness_score: 1 },
                    performancefeedback: { performance_score: 1 },
                  },
                  {
                    muscleId: 2,
                    sorenessfeedback: { soreness_score: 4 },
                    performancefeedback: { performance_score: 4 },
                  },
                ],
              },
              {
                id: 102,
                exerciselogs: [
                  { exercise: { muscleId: 1 } },
                  { exercise: { muscleId: 2 } },
                ],
                sessionmusclefeedback: [
                  {
                    muscleId: 1,
                    sorenessfeedback: { soreness_score: 2 },
                    performancefeedback: { performance_score: 3 },
                  },
                  {
                    muscleId: 2,
                    sorenessfeedback: { soreness_score: 1 },
                    performancefeedback: { performance_score: 1 },
                  },
                ],
              },
              {
                id: 103,
                exerciselogs: [{ exercise: { muscleId: 1 } }],
                sessionmusclefeedback: [
                  {
                    muscleId: 1,
                    sorenessfeedback: { soreness_score: 2 },
                    performancefeedback: { performance_score: 2 },
                  },
                ],
              },
            ],
            startingvolume: [
              { muscleId: 1, set: 10 },
              { muscleId: 2, set: 8 },
            ],
          })
          .mockResolvedValueOnce({ id: 2 }),
      },
    };

    const result = await calculateNextWeekVolumes(prisma, 1);

    expect(result.nextWeekId).toBe(2);
    expect(result.volumes).toEqual([
      { muscleId: 1, set: 10 }, // max score=3 => +0
      { muscleId: 2, set: 10 }, // max score=1 => +2
    ]);
  });
});

describe("validateWeekForProgression", () => {
  it("flags missing feedback for muscles after first weekly occurrence", async () => {
    const prisma = {
      week: {
        findFirst: vi.fn().mockResolvedValue({
          id: 1,
          mesocycleId: 7,
          startingvolume: [{ muscleId: 1, set: 2, muscle: { muscle_name: "chest" } }],
          session: [
            {
              id: 101,
              exerciselogs: [
                {
                  id: 201,
                  exercise: {
                    muscleId: 1,
                    muscle: { muscle_name: "chest" },
                  },
                  set: [{ id: 301, reps: 8, weight: 80, rir: 2 }],
                },
              ],
              sessionmusclefeedback: [],
            },
            {
              id: 102,
              exerciselogs: [
                {
                  id: 202,
                  exercise: {
                    muscleId: 1,
                    muscle: { muscle_name: "chest" },
                  },
                  set: [{ id: 302, reps: 8, weight: 82.5, rir: 1 }],
                },
              ],
              sessionmusclefeedback: [
                {
                  muscleId: 1,
                  sorenessfeedbackId: 1,
                  performancefeedbackId: null,
                  sorenessfeedback: { soreness_score: 2 },
                  performancefeedback: null,
                },
              ],
            },
          ],
        }),
      },
      frequency: {
        findMany: vi.fn().mockResolvedValue([{ muscleId: 1, timesPerWeek: 2 }]),
      },
    };

    const issues = await validateWeekForProgression(prisma, 1);

    expect(issues.some((issue) => issue.code === "MISSING_FEEDBACK")).toBe(true);
  });

  it("flags blank set placeholders saved as 0,0,0", async () => {
    const prisma = {
      week: {
        findFirst: vi.fn().mockResolvedValue({
          id: 1,
          mesocycleId: 7,
          startingvolume: [{ muscleId: 1, set: 1, muscle: { muscle_name: "legs" } }],
          session: [
            {
              id: 101,
              exerciselogs: [
                {
                  id: 201,
                  exercise: {
                    muscleId: 1,
                    muscle: { muscle_name: "legs" },
                  },
                  set: [{ id: 301, reps: 0, weight: 0, rir: 0 }],
                },
              ],
              sessionmusclefeedback: [],
            },
          ],
        }),
      },
      frequency: {
        findMany: vi.fn().mockResolvedValue([{ muscleId: 1, timesPerWeek: 2 }]),
      },
    };

    const issues = await validateWeekForProgression(prisma, 1);

    expect(issues.some((issue) => issue.code === "INCOMPLETE_SET")).toBe(true);
  });

  it("flags incomplete muscle volume when planned sets are not fully completed", async () => {
    const prisma = {
      week: {
        findFirst: vi.fn().mockResolvedValue({
          id: 1,
          mesocycleId: 7,
          startingvolume: [{ muscleId: 1, set: 8, muscle: { muscle_name: "back" } }],
          session: [
            {
              id: 101,
              exerciselogs: [
                {
                  id: 201,
                  exercise: {
                    muscleId: 1,
                    muscle: { muscle_name: "back" },
                  },
                  set: [{ id: 301, reps: 10, weight: 60, rir: 2 }],
                },
              ],
              sessionmusclefeedback: [],
            },
          ],
        }),
      },
      frequency: {
        findMany: vi.fn().mockResolvedValue([{ muscleId: 1, timesPerWeek: 2 }]),
      },
    };

    const issues = await validateWeekForProgression(prisma, 1);

    expect(
      issues.some((issue) => issue.code === "INCOMPLETE_MUSCLE_VOLUME")
    ).toBe(true);
  });
});

describe("resetMesocycleFromWeek", () => {
  it("rejects reset when selected week is week 1", async () => {
    const prisma = {
      week: {
        findFirst: vi.fn().mockResolvedValue({
          id: 21,
          mesocycleId: 5,
          week_name: "week 1",
        }),
        findMany: vi.fn(),
      },
      $transaction: vi.fn(),
    };

    await expect(resetMesocycleFromWeek(prisma, 21)).rejects.toThrow(
      "WEEK_ONE_RESET_NOT_ALLOWED"
    );
    expect(prisma.week.findMany).not.toHaveBeenCalled();
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it("deletes data from selected week onward and keeps earlier weeks", async () => {
    const tx = {
      session: {
        findMany: vi.fn().mockResolvedValue([{ id: 701 }, { id: 702 }]),
        deleteMany: vi.fn().mockResolvedValue({ count: 2 }),
      },
      exerciselog: {
        findMany: vi.fn().mockResolvedValue([{ id: 801 }, { id: 802 }]),
        deleteMany: vi.fn().mockResolvedValue({ count: 2 }),
      },
      set: {
        deleteMany: vi.fn().mockResolvedValue({ count: 6 }),
      },
      sessionMuscleFeedback: {
        deleteMany: vi.fn().mockResolvedValue({ count: 4 }),
      },
      startingVolume: {
        deleteMany: vi.fn().mockResolvedValue({ count: 12 }),
      },
    };

    const prisma = {
      week: {
        findFirst: vi.fn().mockResolvedValue({
          id: 22,
          mesocycleId: 5,
          week_name: "week 2",
        }),
        findMany: vi.fn().mockResolvedValue([
          { id: 21, week_name: "week 1" },
          { id: 22, week_name: "week 2" },
          { id: 23, week_name: "week 3" },
          { id: 24, week_name: "week 4" },
        ]),
      },
      $transaction: vi.fn().mockImplementation(async (callback) => callback(tx)),
    };

    const result = await resetMesocycleFromWeek(prisma, 22);

    expect(result.resetWeekIds).toEqual([22, 23, 24]);
    expect(tx.session.findMany).toHaveBeenCalledWith({
      where: {
        weekId: {
          in: [22, 23, 24],
        },
        deletedAt: null,
      },
      select: {
        id: true,
      },
    });
    expect(tx.startingVolume.deleteMany).toHaveBeenCalledWith({
      where: {
        weekId: {
          in: [22, 23, 24],
        },
        deletedAt: null,
      },
    });
  });
});
