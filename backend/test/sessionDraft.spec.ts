import { describe, expect, it } from "vitest";
import {
  deleteExerciseFromExercises,
  deleteSetFromExercises,
  getPersistableExercises,
} from "../../frontend/src/hooks/sessionDraft";

describe("getPersistableExercises", () => {
  it("filters out draft exercises that should not be saved", () => {
    const exercises = [
      {
        id: 1,
        exercise_name: "Bench Press",
        muscletrained: "chest",
        set: [{ id: 1, reps: "8", weight: "80", rir: "2" }],
      },
      {
        id: 2,
        exercise_name: "",
        muscletrained: "chest",
        set: [{ id: 1, reps: "10", weight: "20", rir: "1" }],
      },
      {
        id: 3,
        exercise_name: "Cable Fly",
        muscletrained: "chest",
        set: [],
      },
    ];

    expect(getPersistableExercises(exercises)).toHaveLength(1);
    expect(getPersistableExercises(exercises)[0]?.id).toBe(1);
  });
});

describe("deleteSetFromExercises", () => {
  it("removes the set and reindexes the remaining set ids", () => {
    const exercises = [
      {
        id: 1,
        exercise_name: "Bench Press",
        muscletrained: "chest",
        set: [
          { id: 1, reps: "8", weight: "80", rir: "2" },
          { id: 2, reps: "6", weight: "85", rir: "1" },
          { id: 3, reps: "10", weight: "70", rir: "3" },
        ],
      },
    ];

    expect(deleteSetFromExercises(exercises, 1, 2)).toEqual([
      {
        id: 1,
        exercise_name: "Bench Press",
        muscletrained: "chest",
        set: [
          { id: 1, reps: "8", weight: "80", rir: "2" },
          { id: 2, reps: "10", weight: "70", rir: "3" },
        ],
      },
    ]);
  });
});

describe("deleteExerciseFromExercises", () => {
  it("removes the exercise and reindexes remaining exercise ids", () => {
    const exercises = [
      {
        id: 1,
        exercise_name: "Bench Press",
        muscletrained: "chest",
        set: [{ id: 1, reps: "8", weight: "80", rir: "2" }],
      },
      {
        id: 2,
        exercise_name: "Row",
        muscletrained: "back",
        set: [{ id: 1, reps: "10", weight: "60", rir: "2" }],
      },
    ];

    expect(deleteExerciseFromExercises(exercises, 1)).toEqual([
      {
        id: 1,
        exercise_name: "Row",
        muscletrained: "back",
        set: [{ id: 1, reps: "10", weight: "60", rir: "2" }],
      },
    ]);
  });
});
