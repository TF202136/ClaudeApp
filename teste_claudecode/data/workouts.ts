import { db } from "@/app/db";
import { exercises, sets, workoutExercises, workouts } from "@/app/db/schema";
import type { Exercise, Set as DrizzleSet, Workout, WorkoutExercise } from "@/app/db/schema";
import { and, eq, gte, inArray, lt } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";

export async function createWorkout(data: {
  userId: string;
  name?: string;
  started_at?: Date;
  completed_at?: Date;
}) {
  const [workout] = await db
    .insert(workouts)
    .values({
      user_id: data.userId,
      name: data.name,
      started_at: data.started_at,
      completed_at: data.completed_at,
    })
    .returning();
  return workout;
}

export async function getUserWorkouts(date: Date) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  const end = new Date(date);
  end.setHours(24, 0, 0, 0);

  return db
    .select()
    .from(workouts)
    .where(
      and(
        eq(workouts.user_id, userId),
        gte(workouts.started_at, start),
        lt(workouts.started_at, end)
      )
    );
}

export type WorkoutExerciseWithDetails = {
  workoutExercise: WorkoutExercise;
  exercise: Exercise;
  sets: DrizzleSet[];
};

export type WorkoutWithDetails = Workout & {
  exercises: WorkoutExerciseWithDetails[];
};

export async function getUserWorkoutsWithDetails(date: Date): Promise<WorkoutWithDetails[]> {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  const end = new Date(date);
  end.setHours(24, 0, 0, 0);

  const userWorkouts = await db
    .select()
    .from(workouts)
    .where(
      and(
        eq(workouts.user_id, userId),
        gte(workouts.started_at, start),
        lt(workouts.started_at, end)
      )
    );

  if (userWorkouts.length === 0) return [];

  const workoutIds = userWorkouts.map((w) => w.id);

  const workoutExercisesWithExercise = await db
    .select({ workoutExercise: workoutExercises, exercise: exercises })
    .from(workoutExercises)
    .innerJoin(exercises, eq(workoutExercises.exercise_id, exercises.id))
    .where(inArray(workoutExercises.workout_id, workoutIds))
    .orderBy(workoutExercises.order);

  if (workoutExercisesWithExercise.length === 0) {
    return userWorkouts.map((w) => ({ ...w, exercises: [] }));
  }

  const workoutExerciseIds = workoutExercisesWithExercise.map(
    (we) => we.workoutExercise.id
  );

  const allSets = await db
    .select()
    .from(sets)
    .where(inArray(sets.workout_exercise_id, workoutExerciseIds))
    .orderBy(sets.set_number);

  const setsMap = new Map<string, DrizzleSet[]>();
  for (const set of allSets) {
    const existing = setsMap.get(set.workout_exercise_id) ?? [];
    existing.push(set);
    setsMap.set(set.workout_exercise_id, existing);
  }

  const exercisesMap = new Map<string, WorkoutExerciseWithDetails[]>();
  for (const row of workoutExercisesWithExercise) {
    const existing = exercisesMap.get(row.workoutExercise.workout_id) ?? [];
    existing.push({
      workoutExercise: row.workoutExercise,
      exercise: row.exercise,
      sets: setsMap.get(row.workoutExercise.id) ?? [],
    });
    exercisesMap.set(row.workoutExercise.workout_id, existing);
  }

  return userWorkouts.map((w) => ({
    ...w,
    exercises: exercisesMap.get(w.id) ?? [],
  }));
}

export async function getWorkoutWithDetails(workoutId: string): Promise<WorkoutWithDetails | null> {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const [workout] = await db
    .select()
    .from(workouts)
    .where(and(eq(workouts.id, workoutId), eq(workouts.user_id, userId)));

  if (!workout) return null;

  const workoutExercisesWithExercise = await db
    .select({ workoutExercise: workoutExercises, exercise: exercises })
    .from(workoutExercises)
    .innerJoin(exercises, eq(workoutExercises.exercise_id, exercises.id))
    .where(eq(workoutExercises.workout_id, workout.id))
    .orderBy(workoutExercises.order);

  if (workoutExercisesWithExercise.length === 0) {
    return { ...workout, exercises: [] };
  }

  const workoutExerciseIds = workoutExercisesWithExercise.map((we) => we.workoutExercise.id);

  const allSets = await db
    .select()
    .from(sets)
    .where(inArray(sets.workout_exercise_id, workoutExerciseIds))
    .orderBy(sets.set_number);

  const setsMap = new Map<string, DrizzleSet[]>();
  for (const set of allSets) {
    const existing = setsMap.get(set.workout_exercise_id) ?? [];
    existing.push(set);
    setsMap.set(set.workout_exercise_id, existing);
  }

  return {
    ...workout,
    exercises: workoutExercisesWithExercise.map((row) => ({
      workoutExercise: row.workoutExercise,
      exercise: row.exercise,
      sets: setsMap.get(row.workoutExercise.id) ?? [],
    })),
  };
}

export async function addExerciseToWorkout(data: {
  workoutId: string;
  exerciseId: string;
  order: number;
}): Promise<WorkoutExercise> {
  const [workoutExercise] = await db
    .insert(workoutExercises)
    .values({
      workout_id: data.workoutId,
      exercise_id: data.exerciseId,
      order: data.order,
    })
    .returning();
  return workoutExercise;
}

export async function addSet(data: {
  workoutExerciseId: string;
  setNumber: number;
  reps?: number;
  weightKg?: string;
  durationSeconds?: number;
}): Promise<DrizzleSet> {
  const [set] = await db
    .insert(sets)
    .values({
      workout_exercise_id: data.workoutExerciseId,
      set_number: data.setNumber,
      reps: data.reps,
      weight_kg: data.weightKg,
      duration_seconds: data.durationSeconds,
    })
    .returning();
  return set;
}

export async function deleteSet(setId: string): Promise<void> {
  await db.delete(sets).where(eq(sets.id, setId));
}
