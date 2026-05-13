import { describe, expect, it, vi } from "vitest";
import { softDeleteMesocycle } from "../src/service/mesocycleService";

describe("softDeleteMesocycle", () => {
  it("soft deletes mesocycle and all related rows in a single transaction", async () => {
    const tx = {
      week: {
        findMany: vi.fn().mockResolvedValue([{ id: 11 }, { id: 12 }]),
        updateMany: vi.fn().mockResolvedValue({ count: 2 }),
      },
      session: {
        findMany: vi.fn().mockResolvedValue([{ id: 21 }, { id: 22 }]),
        updateMany: vi.fn().mockResolvedValue({ count: 2 }),
      },
      exerciselog: {
        findMany: vi.fn().mockResolvedValue([{ id: 31 }, { id: 32 }]),
        updateMany: vi.fn().mockResolvedValue({ count: 2 }),
      },
      set: {
        updateMany: vi.fn().mockResolvedValue({ count: 10 }),
      },
      sessionMuscleFeedback: {
        updateMany: vi.fn().mockResolvedValue({ count: 4 }),
      },
      startingVolume: {
        updateMany: vi.fn().mockResolvedValue({ count: 6 }),
      },
      frequency: {
        updateMany: vi.fn().mockResolvedValue({ count: 13 }),
      },
      mesocycle: {
        updateMany: vi.fn().mockResolvedValue({ count: 1 }),
      },
    };

    const prisma = {
      mesocycle: {
        findFirst: vi.fn().mockResolvedValue({ id: 7, name: "Spring Cut" }),
      },
      $transaction: vi.fn().mockImplementation(async (callback) => callback(tx)),
    };

    const result = await softDeleteMesocycle(prisma, 7);

    expect(prisma.mesocycle.findFirst).toHaveBeenCalledWith({
      where: { id: 7, deletedAt: null },
      select: { id: true, name: true },
    });
    expect(tx.week.findMany).toHaveBeenCalledWith({
      where: { mesocycleId: 7, deletedAt: null },
      select: { id: true },
    });
    expect(tx.session.findMany).toHaveBeenCalledWith({
      where: {
        weekId: { in: [11, 12] },
        deletedAt: null,
      },
      select: { id: true },
    });
    expect(tx.exerciselog.findMany).toHaveBeenCalledWith({
      where: {
        sessionId: { in: [21, 22] },
        deletedAt: null,
      },
      select: { id: true },
    });
    expect(tx.mesocycle.updateMany).toHaveBeenCalledWith({
      where: { id: 7, deletedAt: null },
      data: { deletedAt: expect.any(Date) },
    });
    expect(result).toMatchObject({
      mesocycleId: 7,
      weekCount: 2,
      sessionCount: 2,
      exerciseLogCount: 2,
      setCount: 10,
      feedbackCount: 4,
      startingVolumeCount: 6,
      frequencyCount: 13,
    });
  });

  it("throws when mesocycle does not exist or is already deleted", async () => {
    const prisma = {
      mesocycle: {
        findFirst: vi.fn().mockResolvedValue(null),
      },
      $transaction: vi.fn(),
    };

    await expect(softDeleteMesocycle(prisma, 99)).rejects.toThrow(
      "MESOCYCLE_NOT_FOUND"
    );
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });
});
