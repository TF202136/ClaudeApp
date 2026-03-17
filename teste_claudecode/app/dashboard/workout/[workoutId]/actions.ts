'use server'

import { z } from 'zod'
import { auth } from '@clerk/nextjs/server'
import {
  addExerciseToWorkout,
  addSet,
  deleteSet,
  getWorkoutWithDetails,
} from '@/data/workouts'

const addExerciseSchema = z.object({
  workoutId: z.string().uuid(),
  exerciseId: z.string().uuid(),
})

export async function addExerciseAction(workoutId: string, exerciseId: string) {
  const { userId } = await auth()
  if (!userId) throw new Error('Unauthorized')

  const parsed = addExerciseSchema.safeParse({ workoutId, exerciseId })
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors }
  }

  const workout = await getWorkoutWithDetails(parsed.data.workoutId)
  if (!workout) return { error: 'Workout not found' }

  const order = workout.exercises.length
  const workoutExercise = await addExerciseToWorkout({
    workoutId: parsed.data.workoutId,
    exerciseId: parsed.data.exerciseId,
    order,
  })
  return { data: workoutExercise }
}

const logSetSchema = z.object({
  workoutExerciseId: z.string().uuid(),
  setNumber: z.number().int().positive(),
  reps: z.number().int().positive().optional(),
  weightKg: z.string().optional(),
  durationSeconds: z.number().int().positive().optional(),
})

export async function logSetAction(
  workoutExerciseId: string,
  data: { reps?: number; weightKg?: string; durationSeconds?: number; setNumber: number }
) {
  const { userId } = await auth()
  if (!userId) throw new Error('Unauthorized')

  const parsed = logSetSchema.safeParse({ workoutExerciseId, ...data })
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors }
  }

  const set = await addSet({
    workoutExerciseId: parsed.data.workoutExerciseId,
    setNumber: parsed.data.setNumber,
    reps: parsed.data.reps,
    weightKg: parsed.data.weightKg,
    durationSeconds: parsed.data.durationSeconds,
  })
  return { data: set }
}

const deleteSetSchema = z.object({
  setId: z.string().uuid(),
})

export async function deleteSetAction(setId: string) {
  const { userId } = await auth()
  if (!userId) throw new Error('Unauthorized')

  const parsed = deleteSetSchema.safeParse({ setId })
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors }
  }

  await deleteSet(parsed.data.setId)
  return { data: true as const }
}
