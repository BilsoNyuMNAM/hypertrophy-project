import { describe, expect, it, vi } from "vitest";
import {
  filterPersistableExercises,
  reconcileRemovedSessionData,
  saveSessionExercises,
} from "../src/service/sessionService";

describe("filterPersistableExercises", () => {
  it("drops exercises with blank fields or zero sets", () => {
    const exercises = [
      {
        exercise_name: "Bench Press",
        muscletrained: "chest",
        set: [{ reps: 8, weight: 80, rir: 2 }],
      },
      {
        exercise_name: "   ",
        muscletrained: "chest",
        set: [{ reps: 8, weight: 80, rir: 2 }],
      },
      {
        exercise_name: "Incline Press",
        muscletrained: "   ",
        set: [{ reps: 8, weight: 70, rir: 2 }],
      },
      {
        exercise_name: "Cable Fly",
        muscletrained: "chest",
        set: [],
      },
    ];

    expect(filterPersistableExercises(exercises)).toEqual([
      {
        exercise_name: "Bench Press",
        muscletrained: "chest",
        set: [{ reps: 8, weight: 80, rir: 2 }],
      },
    ]);
  });
});

describe("reconcileRemovedSessionData", () => {
  it("deletes stale exercise logs, their sets, and stale muscle feedback", async () => {
    const tx = {
      exerciselog: {
        findMany: vi.fn().mockResolvedValue([
          { id: 10, exerciseId: 1 },
          { id: 11, exerciseId: 2 },
        ]),
        deleteMany: vi.fn().mockResolvedValue({ count: 1 }),
      },
      set: {
        deleteMany: vi.fn().mockResolvedValue({ count: 3 }),
      },
      sessionMuscleFeedback: {
        deleteMany: vi.fn().mockResolvedValue({ count: 1 }),
      },
    };

    await reconcileRemovedSessionData(tx, 7, [1], [4]);

    expect(tx.exerciselog.findMany).toHaveBeenCalledWith({
      where: { sessionId: 7 },
      select: { id: true, exerciseId: true },
    });
    expect(tx.set.deleteMany).toHaveBeenCalledWith({
      where: { exerciselogId: { in: [11] } },
    });
    expect(tx.exerciselog.deleteMany).toHaveBeenCalledWith({
      where: { id: { in: [11] } },
    });
    expect(tx.sessionMuscleFeedback.deleteMany).toHaveBeenCalledWith({
      where: {
        sessionId: 7,
        muscleId: { notIn: [4] },
      },
    });
  });
});

describe("saveSessionExercises", () => {
  it("saves only persistable exercises and reconciles stale rows", async () => {
    const tx = {
      muscle: {
        findUnique: vi.fn().mockResolvedValue({ id: 4 }),
      },
      exercise: {
        upsert: vi.fn().mockResolvedValue({ id: 21 }),
      },
      exerciselog: {
        upsert: vi.fn().mockResolvedValue({}),
        findMany: vi.fn().mockResolvedValue([{ id: 99, exerciseId: 44 }]),
        deleteMany: vi.fn().mockResolvedValue({ count: 1 }),
      },
      set: {
        deleteMany: vi.fn().mockResolvedValue({ count: 2 }),
      },
      sorenessfeedback: {
        findFirst: vi.fn(),
      },
      performancefeedback: {
        findFirst: vi.fn(),
      },
      sessionMuscleFeedback: {
        upsert: vi.fn(),
        deleteMany: vi.fn().mockResolvedValue({ count: 1 }),
      },
    };

    await saveSessionExercises(tx, 9, [
      {
        exercise_name: "Bench Press",
        muscletrained: "chest",
        set: [{ reps: 8, weight: 80, rir: 2 }],
      },
      {
        exercise_name: "Cable Fly",
        muscletrained: "chest",
        set: [],
      },
      {
        exercise_name: "   ",
        muscletrained: "chest",
        set: [{ reps: 12, weight: 20, rir: 1 }],
      },
    ]);

    expect(tx.muscle.findUnique).toHaveBeenCalledTimes(1);
    expect(tx.exercise.upsert).toHaveBeenCalledTimes(1);
    expect(tx.exerciselog.upsert).toHaveBeenCalledTimes(1);
    expect(tx.set.deleteMany).toHaveBeenCalledWith({
      where: { exerciselogId: { in: [99] } },
    });
    expect(tx.exerciselog.deleteMany).toHaveBeenCalledWith({
      where: { id: { in: [99] } },
    });
    expect(tx.sessionMuscleFeedback.deleteMany).toHaveBeenCalledWith({
      where: {
        sessionId: 9,
        muscleId: { notIn: [4] },
      },
    });
  });
});
