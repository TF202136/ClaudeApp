# Data Mutations

All data mutations follow a two-layer pattern: **server actions** call **data helper functions**, which wrap Drizzle ORM queries. No layer may be skipped.

## Layer 1: Data Helpers (`src/data/`)

All direct database calls must live in helper functions inside `src/data/`. These functions are the only place Drizzle ORM is called for mutations. They must not contain business logic — they are thin wrappers around db operations.

Organize files by domain:

```
src/data/
  workouts.ts
  exercises.ts
  users.ts
```

Example helper:

```ts
// src/data/workouts.ts
import { db } from '@/lib/db'
import { workouts } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export async function createWorkout(data: {
  userId: string
  name: string
  scheduledAt: Date
}) {
  const [workout] = await db.insert(workouts).values(data).returning()
  return workout
}

export async function deleteWorkout(id: string) {
  await db.delete(workouts).where(eq(workouts.id, id))
}

export async function updateWorkout(id: string, data: { name?: string; scheduledAt?: Date }) {
  const [workout] = await db
    .update(workouts)
    .set(data)
    .where(eq(workouts.id, id))
    .returning()
  return workout
}
```

Rules for data helpers:
- Live in `src/data/` — never inline db calls in server actions, components, or route handlers.
- No auth checks — auth belongs in the server action layer.
- No Zod validation — validation belongs in the server action layer.
- Return the mutated record(s) where useful; return `void` for deletes.

## Layer 2: Server Actions (`actions.ts`)

All mutations triggered from the UI must go through a Next.js server action. Server actions must be defined in a colocated `actions.ts` file alongside the route or component that uses them.

```
app/dashboard/workouts/
  page.tsx
  actions.ts       ← server actions for this route
```

Every `actions.ts` file must start with `'use server'`.

### Typing params

Action parameters must be explicitly typed with an inline type or a named TypeScript type. `FormData` is never an acceptable parameter type.

```ts
// ✅ correct
export async function createWorkoutAction(params: {
  name: string
  scheduledAt: Date
}) { ... }

// ❌ wrong — FormData not allowed
export async function createWorkoutAction(formData: FormData) { ... }
```

### Zod validation

Every server action must validate its arguments with Zod before doing anything else. Define the schema at the top of the action, parse with `safeParse`, and return an error early if validation fails.

```ts
'use server'

import { z } from 'zod'
import { auth } from '@clerk/nextjs/server'
import { createWorkout } from '@/data/workouts'

const createWorkoutSchema = z.object({
  name: z.string().min(1).max(100),
  scheduledAt: z.coerce.date(),
})

export async function createWorkoutAction(params: {
  name: string
  scheduledAt: Date
}) {
  const { userId } = await auth()
  if (!userId) throw new Error('Unauthorized')

  const parsed = createWorkoutSchema.safeParse(params)
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors }
  }

  const workout = await createWorkout({ userId, ...parsed.data })
  return { data: workout }
}
```

### Return shape

Server actions should return a consistent shape so the caller can distinguish success from failure:

```ts
// success
return { data: result }

// validation or business logic failure
return { error: '...' }

// unexpected errors — throw, let Next.js error boundaries handle it
throw new Error('...')
```

## Rules

- Database mutations only happen through `src/data/` helper functions — never call `db` directly in server actions, components, or route handlers.
- Server actions only live in colocated `actions.ts` files — never inline `'use server'` functions inside components.
- All server action params must be typed — `FormData` is not allowed.
- All server action params must be validated with Zod before any db call or auth side-effect.
- Auth checks (`auth()` from Clerk) must happen at the top of every server action that touches user-owned data, before validation and before any db call.
- Data helpers must not be called directly from client components.
