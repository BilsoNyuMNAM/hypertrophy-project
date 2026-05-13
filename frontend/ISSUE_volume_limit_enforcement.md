# Problem: No Volume Limit Enforcement When Adding Sets

## Brief Description

The Hypertrophy app tracks weekly training volume (number of sets per muscle group) and displays how many sets are remaining for each muscle. However, **there is no mechanism to prevent users from adding more sets once they exceed their weekly volume target**.

Users can click "+ ADD SET" indefinitely, even after completing 100% of their planned volume. The system calculates and displays volume information purely for informational purposes - it never enforces any limits.

---

## Related Code

### 1. Frontend: Add Set Function (No Validation)

**File:** `frontend/src/hooks/useSession.tsx:169-188`

```typescript
function addSet(exerciseid: number) {
    console.log("exerciseid", exerciseid)
    const exerciseId = Number(exerciseid)
    setAddexercise(addexercise.map(exercise => {
        if (exercise.id === exerciseId) {
            return {
                ...exercise,
                set: [...exercise.set, {
                    id: exercise.set.length + 1,
                    reps: "",
                    weight: "",
                    rir: ""
                }]
            }
        }
    return exercise
    }))
}
```

**Problem:** This function blindly appends a new set. There's no check for:
- Current weekly volume for the muscle
- Target volume threshold
- Whether the user has exceeded their limit

---

### 2. Frontend: Add Set Button (Always Enabled)

**File:** `frontend/src/pages/Exercisecomponent.tsx:90`

```tsx
<button className="cursor-pointer text-xs font-spaceMono" onClick={()=>{addset(id)}}>+ ADD SET </button>
```

**Problem:** The button has no `disabled` state and no conditional logic. It's always clickable regardless of volume status.

---

### 3. Frontend: Volume Calculation (Display Only)

**File:** `frontend/src/hooks/sessionWeeklySummary.ts:23-72`

```typescript
export function buildSessionWeeklySetSummary(
  summarySeed: SessionWeeklySetSummarySeed[],
  exercises: SessionExerciseDraft[]
): SessionWeeklySetSummaryRow[] {
  // ... calculates sets per muscle ...

  return muscleOrder.map((muscleKey) => {
    const seedRow = summarySeedByMuscle.get(muscleKey);
    const targetSets = seedRow?.targetSets || 0;
    const completedSetsOutsideSession = seedRow?.completedSetsOutsideSession || 0;
    const currentSessionSets = currentSessionSetsByMuscle.get(muscleKey) || 0;
    const completedSets = completedSetsOutsideSession + currentSessionSets;

    return {
      muscleName: draftMuscleLabels.get(muscleKey) || seedRow?.muscleName || muscleKey,
      targetSets,
      completedSetsOutsideSession,
      currentSessionSets,
      completedSets,
      setsLeft: Math.max(targetSets - completedSets, 0),  // <-- Only for display!
    };
  });
}
```

**Problem:** The `setsLeft` value is calculated but only returned for display. It's never used to control whether adding sets should be allowed.

---

### 4. Frontend: Volume Display UI (Informational Only)

**File:** `frontend/src/pages/Sessionpage.tsx:65-102`

```tsx
{weeklySetSummary.map((summary) => {
    return (
        <div key={summary.muscleName} className="rounded-[10px] border border-[#191919] bg-black/40 px-4 py-3">
            <div className="flex items-center justify-between gap-4">
                <span className="font-spaceMono text-sm uppercase">
                    {summary.muscleName}
                </span>
                <span className="font-spaceMono text-sm text-[#c8ff00] uppercase">
                    {summary.setsLeft} left
                </span>
            </div>
            <p className="mt-2 font-spaceMono text-[10px] tracking-[0.08em] text-[#7b7b7b] uppercase">
                {summary.completedSets}/{summary.targetSets} weekly sets counted
            </p>
            <p className="mt-1 font-spaceMono text-[10px] text-[#555] uppercase tracking-[0.08em]">
                Current session: {summary.currentSessionSets} sets
            </p>
        </div>
    )
})}
```

**Problem:** The UI shows volume stats but:
- No warning when volume is exceeded
- No color change (e.g., red) when over limit
- No feedback mechanism to discourage adding more sets

---

### 5. Backend: Save Sets API (No Validation)

**File:** `backend/src/api/mesoCycle/Session/route.ts:52-97`

```typescript
sessionRoute.post("/add/set/:sessionId", async (c) => {
  const prisma = getPrismaClient(c.env);
  const sessionId = Number(c.req.param("sessionId"));
  const body: SessionPayload = await c.req.json();

  const activeSession = await prisma.session.findFirst({
    where: {
      id: sessionId,
      deletedAt: null,
    },
    select: {
      id: true,
    },
  });

  if (!activeSession) {
    return c.json({ message: "Session not found" }, 404);
  }

  try {
    await prisma.$transaction(
      async (tx) => {
        await saveSessionExercises(tx, sessionId, body.sessionData);  // <-- No volume check!
      },
      { maxWait: 15000, timeout: 15000 }
    );

    return c.json({ message: "Session is saved successfully" });
  } catch (error) {
    // ... error handling
  }
});
```

**Problem:** The backend only checks if the session exists. It does NOT:
- Validate weekly volume before saving
- Reject requests that would exceed volume limits
- Return warnings about exceeding volume

---

### 6. Backend: Week Progression Validation (Checks Under-completion Only)

**File:** `backend/src/service/weekProgressionService.ts:196-208`

```typescript
week.startingvolume.forEach(
  (planned: { muscleId: number; set: number; muscle: { muscle_name: string } }) => {
    const completed = completedVolumeByMuscle.get(planned.muscleId) || 0;
    if (completed < planned.set) {  // <-- Only checks if UNDER the target!
      issues.push({
        code: "INCOMPLETE_MUSCLE_VOLUME",
        muscleId: planned.muscleId,
        muscleName: planned.muscle.muscle_name,
        message: `${planned.muscle.muscle_name} volume is incomplete (${completed}/${planned.set} sets). Complete this first.`,
      });
    }
  }
);
```

**Problem:** This validation only fires when progressing to the next week and only checks if volume is **under** the target. There's no check for **over**-completion.

---

## Summary Table

| Layer | File | Issue |
|-------|------|-------|
| Frontend Hook | `useSession.tsx:169-188` | `addSet()` has no volume validation |
| Frontend UI | `Exercisecomponent.tsx:90` | Button is always enabled |
| Frontend Logic | `sessionWeeklySummary.ts:69` | `setsLeft` is display-only |
| Frontend UI | `Sessionpage.tsx:65-102` | No visual warning for over-volume |
| Backend API | `Session/route.ts:52-97` | Saves sets without volume checks |
| Backend Validation | `weekProgressionService.ts:196-208` | Only validates under-completion |

---

## Expected Behavior (Missing)

1. **Soft limit:** Show a warning when volume is exceeded (e.g., "You've exceeded your weekly target for Chest")
2. **Hard limit (optional):** Disable the "+ ADD SET" button when `setsLeft === 0`
3. **Visual feedback:** Change color from green to red/orange when over volume
4. **Backend validation:** Optionally reject or warn when saving sets that exceed limits
