import { describe, expect, it } from "vitest";
import { isWeekUnlocked, selectWeekOneId } from "../src/api/mesoCycle/create";
import { resolveVolumeSeedRows } from "../src/api/mesoCycle/Week/Volume/volume";

describe("isWeekUnlocked", () => {
  it("always unlocks week 1 even if starting volumes are missing", () => {
    expect(isWeekUnlocked("week 1", 0)).toBe(true);
  });

  it("keeps non-week-1 locked when starting volume is missing", () => {
    expect(isWeekUnlocked("week 2", 0)).toBe(false);
  });
});

describe("resolveVolumeSeedRows", () => {
  it("returns current week rows when present", () => {
    const result = resolveVolumeSeedRows({
      weekNumber: 1,
      currentRows: [{ muscle_name: "chest", set: 12 }],
      fallbackRows: [{ muscle_name: "back", set: 10 }],
      frequencyMuscles: ["legs"],
    });

    expect(result).toEqual([{ muscle_name: "chest", set: 12 }]);
  });

  it("uses fallback week rows for week 1 when current rows are missing", () => {
    const result = resolveVolumeSeedRows({
      weekNumber: 1,
      currentRows: [],
      fallbackRows: [{ muscle_name: "back", set: 10 }],
      frequencyMuscles: ["legs"],
    });

    expect(result).toEqual([{ muscle_name: "back", set: 10 }]);
  });

  it("builds zero-set rows from frequencies if week 1 and no volume rows exist", () => {
    const result = resolveVolumeSeedRows({
      weekNumber: 1,
      currentRows: [],
      fallbackRows: [],
      frequencyMuscles: ["back", "chest"],
    });

    expect(result).toEqual([
      { muscle_name: "back", set: 0 },
      { muscle_name: "chest", set: 0 },
    ]);
  });
});

describe("selectWeekOneId", () => {
  it("picks week 1 id even when returned rows are not in order", () => {
    const id = selectWeekOneId([
      { id: 44, week_name: "week 3" },
      { id: 42, week_name: "week 2" },
      { id: 41, week_name: "week 1" },
      { id: 43, week_name: "week 4" },
    ]);

    expect(id).toBe(41);
  });

  it("throws when week 1 row is missing", () => {
    expect(() =>
      selectWeekOneId([
        { id: 42, week_name: "week 2" },
        { id: 43, week_name: "week 3" },
      ])
    ).toThrow("WEEK_ONE_NOT_FOUND");
  });
});
