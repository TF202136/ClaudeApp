'use server'

import { z } from 'zod'
import { auth } from '@clerk/nextjs/server'
import { createWorkout } from '@/data/workouts'
import { redirect } from 'next/navigation'

const createWorkoutSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255),
  started_at: z.coerce.date(),
  completed_at: z.coerce.date().optional(),
})

export async function createWorkoutAction(params: {
  name: string
  started_at: Date
  completed_at?: Date
}) {
  const { userId } = await auth()
  if (!userId) throw new Error('Unauthorized')

  const parsed = createWorkoutSchema.safeParse(params)
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors }
  }

  const workout = await createWorkout({ userId, ...parsed.data })
  redirect(`/dashboard/workout/${workout.id}`)
  return { data: workout }
}
