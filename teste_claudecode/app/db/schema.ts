import {
  pgTable,
  uuid,
  text,
  varchar,
  integer,
  numeric,
  timestamp,
} from 'drizzle-orm/pg-core';
import { InferSelectModel, InferInsertModel } from 'drizzle-orm';

// ---------------------------------------------------------------------------
// exercises — catalog / library of movements
// ---------------------------------------------------------------------------
export const exercises = pgTable('exercises', {
  id: uuid('id').defaultRandom().primaryKey(),
  user_id: text('user_id'), // null = global/seed exercise
  name: varchar('name', { length: 255 }).notNull(),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
});

export type Exercise = InferSelectModel<typeof exercises>;
export type NewExercise = InferInsertModel<typeof exercises>;

// ---------------------------------------------------------------------------
// workouts — a single training session
// ---------------------------------------------------------------------------
export const workouts = pgTable('workouts', {
  id: uuid('id').defaultRandom().primaryKey(),
  user_id: text('user_id').notNull(),
  name: varchar('name', { length: 255 }),
  started_at: timestamp('started_at'),
  completed_at: timestamp('completed_at'), // nullable while session is in progress
  created_at: timestamp('created_at').defaultNow(),
});

export type Workout = InferSelectModel<typeof workouts>;
export type NewWorkout = InferInsertModel<typeof workouts>;

// ---------------------------------------------------------------------------
// workout_exercises — ordered exercises inside a workout
// ---------------------------------------------------------------------------
export const workoutExercises = pgTable('workout_exercises', {
  id: uuid('id').defaultRandom().primaryKey(),
  workout_id: uuid('workout_id')
    .notNull()
    .references(() => workouts.id, { onDelete: 'cascade' }),
  exercise_id: uuid('exercise_id')
    .notNull()
    .references(() => exercises.id),
  order: integer('order').notNull(),
  created_at: timestamp('created_at').defaultNow(),
});

export type WorkoutExercise = InferSelectModel<typeof workoutExercises>;
export type NewWorkoutExercise = InferInsertModel<typeof workoutExercises>;

// ---------------------------------------------------------------------------
// sets — individual sets within a workout exercise
// ---------------------------------------------------------------------------
export const sets = pgTable('sets', {
  id: uuid('id').defaultRandom().primaryKey(),
  workout_exercise_id: uuid('workout_exercise_id')
    .notNull()
    .references(() => workoutExercises.id, { onDelete: 'cascade' }),
  set_number: integer('set_number').notNull(),
  reps: integer('reps'), // nullable for timed sets
  weight_kg: numeric('weight_kg', { precision: 6, scale: 2 }), // nullable for bodyweight
  duration_seconds: integer('duration_seconds'), // nullable for strength sets
  created_at: timestamp('created_at').defaultNow(),
});

export type Set = InferSelectModel<typeof sets>;
export type NewSet = InferInsertModel<typeof sets>;
