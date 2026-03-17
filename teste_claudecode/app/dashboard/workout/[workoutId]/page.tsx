import { notFound } from 'next/navigation'
import { format } from 'date-fns'
import { getWorkoutWithDetails } from '@/data/workouts'
import { getExercises } from '@/data/exercises'
import WorkoutLogger from './WorkoutLogger'

interface WorkoutPageProps {
  params: Promise<{ workoutId: string }>
}

export default async function WorkoutPage({ params }: WorkoutPageProps) {
  const { workoutId } = await params

  const [workout, allExercises] = await Promise.all([
    getWorkoutWithDetails(workoutId),
    getExercises(),
  ])

  if (!workout) notFound()

  const duration =
    workout.started_at && workout.completed_at
      ? (() => {
          const minutes = Math.round(
            (new Date(workout.completed_at).getTime() -
              new Date(workout.started_at).getTime()) /
              60000
          )
          if (minutes < 60) return `${minutes}m`
          const h = Math.floor(minutes / 60)
          const m = minutes % 60
          return m === 0 ? `${h}h` : `${h}h ${m}m`
        })()
      : null

  return (
    <div className="max-w-2xl mx-auto px-6 py-8 space-y-8">
      <div>
        <h1 className="text-2xl font-semibold">{workout.name ?? 'Untitled Workout'}</h1>
        <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
          {workout.started_at && (
            <span>{format(new Date(workout.started_at), 'MMMM d, yyyy h:mm a')}</span>
          )}
          {duration && <span>{duration}</span>}
        </div>
      </div>

      <WorkoutLogger workout={workout} allExercises={allExercises} />
    </div>
  )
}
