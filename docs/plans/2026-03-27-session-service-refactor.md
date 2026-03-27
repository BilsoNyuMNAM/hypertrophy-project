# Session Route Service Refactor Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Extract business logic from session route into dedicated service files for better separation of concerns, testability, and maintainability.

**Architecture:** Create three service files - types for shared interfaces, sessionService for exercise/set logic, feedbackService for soreness/performance logic. The route handler becomes thin, only parsing requests and calling services.

**Tech Stack:** TypeScript, Hono, Prisma (with transaction support)

---

## Task 1: Create TypeScript Types File

**Files:**
- Create: `backend/src/service/types.ts`

**Step 1: Create the types file with all interfaces**

```typescript
// Types for session-related operations

export interface SetData {
  reps: number;
  weight: number;
  rir: number;
}

export interface SorenessData {
  soreness_score?: number;
  score?: number;
  description?: string;
}

export interface PerformanceData {
  performance_score?: number;
  score?: number;
  description?: string;
}

export interface ExerciseData {
  exercise_name: string;
  muscletrained: string;
  set: SetData[];
  soreness?: SorenessData | null;
  performance?: PerformanceData | null;
}

export interface SessionPayload {
  sessionData: ExerciseData[];
}

// Prisma transaction type - using any to avoid complex generics
export type PrismaTransaction = any;
```

**Step 2: Verify file was created**

Run: `cat backend/src/service/types.ts`
Expected: File contents displayed

---

## Task 2: Create Utility Functions File

**Files:**
- Create: `backend/src/service/utils.ts`

**Step 1: Create utils file with helper functions**

```typescript
// Utility functions for session operations

/**
 * Trims whitespace from start and end of string
 * Replaces the custom Spaceremover function with native trim
 */
export function normalizeExerciseName(exerciseName: string): string {
  return exerciseName.trim().toLowerCase();
}

/**
 * Extracts score from soreness or performance data
 * Handles both score and soreness_score/performance_score field names
 */
export function extractScore(data: { score?: number; soreness_score?: number; performance_score?: number } | null | undefined): number {
  if (!data) return 0;
  return Number(data.soreness_score || data.performance_score || data.score || 0);
}
```

**Step 2: Verify file was created**

Run: `cat backend/src/service/utils.ts`
Expected: File contents displayed

---

## Task 3: Create Exercise Service

**Files:**
- Create: `backend/src/service/exerciseService.ts`

**Step 1: Create exercise service with muscle lookup and exercise upsert**

```typescript
import { PrismaTransaction } from "./types";
import { normalizeExerciseName } from "./utils";

/**
 * Finds muscle ID by muscle name
 * Throws error if muscle not found
 */
export async function getMuscleId(
  tx: PrismaTransaction,
  muscleName: string
): Promise<number> {
  const muscleRecord = await tx.muscle.findUnique({
    where: { muscle_name: muscleName },
    select: { id: true },
  });

  if (!muscleRecord?.id) {
    throw new Error(`Muscle not found: ${muscleName}`);
  }

  return muscleRecord.id;
}

/**
 * Creates or finds an exercise by name
 * Returns the exercise record with id
 */
export async function upsertExercise(
  tx: PrismaTransaction,
  exerciseName: string,
  muscleId: number
): Promise<{ id: number }> {
  const normalizedName = normalizeExerciseName(exerciseName);

  const exerciseRecord = await tx.exercise.upsert({
    where: { exercise_name: normalizedName },
    update: {},
    create: {
      exercise_name: normalizedName,
      muscleId: muscleId,
    },
  });

  return exerciseRecord;
}
```

**Step 2: Verify file was created**

Run: `cat backend/src/service/exerciseService.ts`
Expected: File contents displayed

---

## Task 4: Create Set Service

**Files:**
- Create: `backend/src/service/setService.ts`

**Step 1: Create set service with exercise log and set handling**

```typescript
import { PrismaTransaction, SetData } from "./types";

/**
 * Maps raw set data to database format
 */
function formatSetData(sets: SetData[]) {
  return sets.map((set) => ({
    reps: Number(set.reps),
    weight: Number(set.weight),
    rir: Number(set.rir),
  }));
}

/**
 * Creates or updates exercise log with sets
 * If updating, deletes old sets and creates new ones
 */
export async function upsertExerciseLog(
  tx: PrismaTransaction,
  sessionId: number,
  exerciseId: number,
  sets: SetData[]
): Promise<void> {
  const formattedSets = formatSetData(sets);

  await tx.exerciselog.upsert({
    where: {
      exerciseId_sessionId: {
        exerciseId: exerciseId,
        sessionId: sessionId,
      },
    },
    create: {
      sessionId: sessionId,
      exerciseId: exerciseId,
      set: {
        createMany: {
          data: formattedSets,
        },
      },
    },
    update: {
      set: {
        deleteMany: {},
        createMany: {
          data: formattedSets,
        },
      },
    },
  });
}
```

**Step 2: Verify file was created**

Run: `cat backend/src/service/setService.ts`
Expected: File contents displayed

---

## Task 5: Create Feedback Service

**Files:**
- Create: `backend/src/service/feedbackService.ts`

**Step 1: Create feedback service for soreness and performance**

```typescript
import { PrismaTransaction, SorenessData, PerformanceData } from "./types";
import { extractScore } from "./utils";

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
 * Looks up performance feedback record by score
 * Returns the feedback record or null if not found
 */
async function getPerformanceFeedback(
  tx: PrismaTransaction,
  score: number
): Promise<{ id: number } | null> {
  return await tx.performancefeedback.findFirst({
    where: { performance_score: score },
  });
}

/**
 * Saves muscle feedback (soreness and/or performance) for a session
 * Uses upsert to handle both create and update cases
 */
export async function saveMuscleFeedback(
  tx: PrismaTransaction,
  sessionId: number,
  muscleId: number,
  soreness: SorenessData | null | undefined,
  performance: PerformanceData | null | undefined
): Promise<void> {
  // Skip if no feedback data provided
  if (!soreness && !performance) {
    return;
  }

  const updateData: Record<string, any> = {};
  const createData: Record<string, any> = {
    session: { connect: { id: sessionId } },
    muscle: { connect: { id: muscleId } },
  };

  // Handle soreness feedback
  if (soreness) {
    const score = extractScore(soreness);
    const sorenessLookup = await getSorenessFeedback(tx, score);
    if (sorenessLookup) {
      updateData.sorenessfeedback = { connect: { id: sorenessLookup.id } };
      createData.sorenessfeedback = { connect: { id: sorenessLookup.id } };
    }
  }

  // Handle performance feedback
  if (performance) {
    const score = extractScore(performance);
    const performanceLookup = await getPerformanceFeedback(tx, score);
    if (performanceLookup) {
      updateData.performancefeedback = { connect: { id: performanceLookup.id } };
      createData.performancefeedback = { connect: { id: performanceLookup.id } };
    }
  }

  // Only upsert if we have data to save
  if (Object.keys(updateData).length > 0) {
    await tx.sessionMuscleFeedback.upsert({
      where: {
        sessionId_muscleId: {
          sessionId: sessionId,
          muscleId: muscleId,
        },
      },
      update: updateData,
      create: createData,
    });
  }
}
```

**Step 2: Verify file was created**

Run: `cat backend/src/service/feedbackService.ts`
Expected: File contents displayed

---

## Task 6: Create Main Session Service

**Files:**
- Create: `backend/src/service/sessionService.ts`

**Step 1: Create session service that orchestrates all operations**

```typescript
import { PrismaTransaction, ExerciseData } from "./types";
import { getMuscleId, upsertExercise } from "./exerciseService";
import { upsertExerciseLog } from "./setService";
import { saveMuscleFeedback } from "./feedbackService";

/**
 * Processes a single exercise within a session
 * Handles exercise creation, sets, and feedback
 */
export async function processExercise(
  tx: PrismaTransaction,
  sessionId: number,
  exercise: ExerciseData
): Promise<void> {
  // 1. Get muscle ID
  const muscleId = await getMuscleId(tx, exercise.muscletrained);

  // 2. Upsert exercise
  const exerciseRecord = await upsertExercise(tx, exercise.exercise_name, muscleId);

  // 3. Upsert exercise log with sets
  await upsertExerciseLog(tx, sessionId, exerciseRecord.id, exercise.set);

  // 4. Save feedback if present
  await saveMuscleFeedback(tx, sessionId, muscleId, exercise.soreness, exercise.performance);
}

/**
 * Saves all exercises for a session
 * Processes each exercise in sequence within the transaction
 */
export async function saveSessionExercises(
  tx: PrismaTransaction,
  sessionId: number,
  exercises: ExerciseData[]
): Promise<void> {
  for (const exercise of exercises) {
    await processExercise(tx, sessionId, exercise);
  }
}
```

**Step 2: Verify file was created**

Run: `cat backend/src/service/sessionService.ts`
Expected: File contents displayed

---

## Task 7: Create Index Export File

**Files:**
- Create: `backend/src/service/index.ts`

**Step 1: Create barrel export file**

```typescript
// Service layer exports

export * from "./types";
export * from "./utils";
export * from "./exerciseService";
export * from "./setService";
export * from "./feedbackService";
export * from "./sessionService";
```

**Step 2: Verify file was created**

Run: `cat backend/src/service/index.ts`
Expected: File contents displayed

---

## Task 8: Refactor Session Route

**Files:**
- Modify: `backend/src/api/mesoCycle/Session/route.ts`

**Step 1: Update route to use services**

Replace the entire file with:

```typescript
import { Hono } from "hono";
import { getPrismaClient } from "../../../../lib/prismaClient";
import { saveSessionExercises, SessionPayload } from "../../../service";

const sessionRoute = new Hono<{ Bindings: { DATABASE_URL: string } }>();

sessionRoute.post("/create/:weeId", async (c) => {
  const body = await c.req.json();
  const prisma = getPrismaClient(c.env);
  const weekId = Number(c.req.param("weeId"));

  const result = await prisma.session.create({
    data: {
      session_name: body.session_name,
      weekId: weekId,
    },
  });
  return c.json(
    {
      message: "Session created successfully",
      result: result,
    },
    201
  );
});

sessionRoute.post("/add/set/:sessionId", async (c) => {
  const prisma = getPrismaClient(c.env);
  const sessionId = Number(c.req.param("sessionId"));
  const body: SessionPayload = await c.req.json();

  try {
    await prisma.$transaction(
      async (tx) => {
        await saveSessionExercises(tx, sessionId, body.sessionData);
      },
      { maxWait: 10000, timeout: 10000 }
    );

    return c.json({
      message: "Session is saved successfully",
    });
  } catch (error) {
    return c.json(
      {
        error: "An error occurred while saving the session data",
        details: error instanceof Error ? error.message : String(error),
      },
      500
    );
  }
});

sessionRoute.get("/all/:weekId", async (c) => {
  const prisma = getPrismaClient(c.env);
  const weekId = Number(c.req.param("weekId"));

  const sessions = {
    sessions: await prisma.session.findMany({
      where: {
        weekId: weekId,
      },
      select: {
        id: true,
        session_name: true,
        exerciselogs: {
          select: {
            id: true,
            exerciseId: true,
            set: {
              select: {
                id: true,
                reps: true,
                weight: true,
                rir: true,
              },
            },
          },
        },
      },
    }),
    weekStatus: await prisma.week.findUnique({
      where: {
        id: weekId,
      },
      select: {
        completed: true,
      },
    }),
  };
  const length = sessions.sessions.length;
  return c.json({
    message: `All the session for weekID ${weekId} is fetched successfully:`,
    result: sessions,
    totalSessions: length,
  });
});

sessionRoute.patch("/booleanUpdate/:weekId", async (c) => {
  const prisma = getPrismaClient(c.env);
  const weekId = Number(c.req.param("weekId"));
  const body = await c.req.json();
  const completed = body.booleanStatus;
  const booleanResult = await prisma.week.update({
    where: {
      id: weekId,
    },
    data: {
      completed: completed,
    },
  });
  return c.json(
    {
      message: "boolean update successfull",
      result: booleanResult,
    },
    200
  );
});

sessionRoute.get("/:sessionId", async (c) => {
  const prisma = getPrismaClient(c.env);
  const sessionId = Number(c.req.param("sessionId"));
  const sessions = await prisma.session.findUnique({
    where: {
      id: sessionId,
    },
    select: {
      session_name: true,
      id: true,
      exerciselogs: {
        select: {
          exercise: {
            select: {
              exercise_name: true,
              muscle: {
                select: {
                  muscle_name: true,
                },
              },
            },
          },
          set: {
            select: {
              reps: true,
              weight: true,
              rir: true,
            },
          },
        },
      },
      sessionmusclefeedback: {
        select: {
          muscle: {
            select: {
              muscle_name: true,
            },
          },
          sorenessfeedback: {
            select: {
              soreness_score: true,
              description: true,
            },
          },
          performancefeedback: {
            select: {
              performance_score: true,
              description: true,
            },
          },
        },
      },
    },
  });

  if (sessions === null) {
    return c.json(
      {
        message: "No session found with the specified id",
      },
      404
    );
  }

  // Build a map of muscle_name -> feedback for quick lookup
  const feedbackMap = new Map();
  sessions.sessionmusclefeedback?.forEach((fb) => {
    if (fb.muscle?.muscle_name) {
      feedbackMap.set(fb.muscle.muscle_name, {
        soreness: fb.sorenessfeedback
          ? {
              soreness_score: fb.sorenessfeedback.soreness_score,
              description: fb.sorenessfeedback.description,
            }
          : null,
        performance: fb.performancefeedback
          ? {
              performance_score: fb.performancefeedback.performance_score,
              description: fb.performancefeedback.description,
            }
          : null,
      });
    }
  });

  const eachexercise = sessions.exerciselogs.map((exerciselog) => {
    const exercise_name = exerciselog.exercise.exercise_name;
    const muscletrained = exerciselog.exercise.muscle.muscle_name;
    const set = exerciselog.set;

    // Get feedback for this muscle if it exists
    const feedback = feedbackMap.get(muscletrained);

    return {
      exercise_name,
      muscletrained,
      set,
      ...(feedback?.soreness && { soreness: feedback.soreness }),
      ...(feedback?.performance && { performance: feedback.performance }),
    };
  });

  return c.json({
    message: "Session data with the specified id is being fetched",
    session_name: sessions.session_name,
    eachexercise: eachexercise,
  });
});

export default sessionRoute;
```

**Step 2: Verify the refactored route compiles**

Run: `cd backend && npx tsc --noEmit`
Expected: No errors

---

## Task 9: Verify Build

**Step 1: Run TypeScript check**

Run: `cd backend && npx tsc --noEmit`
Expected: No type errors

**Step 2: Test the application builds**

Run: `cd backend && npm run build` (or appropriate build command)
Expected: Build succeeds

---

## Summary

After completing all tasks, the service folder will contain:

```
backend/src/service/
  index.ts           - Barrel exports
  types.ts           - TypeScript interfaces
  utils.ts           - Helper functions
  exerciseService.ts - Muscle and exercise operations
  setService.ts      - Exercise log and set operations
  feedbackService.ts - Soreness and performance feedback
  sessionService.ts  - Orchestration layer
```

The route file is reduced from ~180 lines to ~180 lines but with no business logic - just request parsing, service calls, and response formatting. All business logic is now in testable service functions.
