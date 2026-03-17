import 'dotenv/config'
import { drizzle } from 'drizzle-orm/neon-http'
import { exercises } from '../app/db/schema'

const db = drizzle(process.env.DATABASE_URL!)

const EXERCISES = [
  // Chest
  'Bench Press',
  'Incline Bench Press',
  'Decline Bench Press',
  'Push-Up',
  'Dumbbell Fly',
  'Cable Fly',
  // Back
  'Pull-Up',
  'Lat Pulldown',
  'Barbell Row',
  'Dumbbell Row',
  'Seated Cable Row',
  'Deadlift',
  // Shoulders
  'Overhead Press',
  'Dumbbell Shoulder Press',
  'Lateral Raise',
  'Front Raise',
  'Face Pull',
  // Arms
  'Barbell Curl',
  'Dumbbell Curl',
  'Hammer Curl',
  'Tricep Pushdown',
  'Skull Crusher',
  'Dips',
  // Legs
  'Squat',
  'Romanian Deadlift',
  'Leg Press',
  'Leg Extension',
  'Leg Curl',
  'Calf Raise',
  'Lunge',
  'Bulgarian Split Squat',
  // Core
  'Plank',
  'Crunch',
  'Sit-Up',
  'Leg Raise',
  'Russian Twist',
  'Ab Wheel Rollout',
]

async function seed() {
  console.log('Seeding exercises...')
  await db
    .insert(exercises)
    .values(EXERCISES.map((name) => ({ name })))
    .onConflictDoNothing()
  console.log(`Inserted ${EXERCISES.length} exercises.`)
}

seed().catch((err) => {
  console.error(err)
  process.exit(1)
})
