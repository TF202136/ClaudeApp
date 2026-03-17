'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type { WorkoutWithDetails, WorkoutExerciseWithDetails } from '@/data/workouts'
import type { Exercise } from '@/app/db/schema'
import { addExerciseAction, logSetAction, deleteSetAction } from './actions'

interface WorkoutLoggerProps {
  workout: WorkoutWithDetails
  allExercises: Exercise[]
}

type FormState = { reps: string; weightKg: string; durationSeconds: string }

const defaultForm: FormState = { reps: '', weightKg: '', durationSeconds: '' }

export default function WorkoutLogger({ workout, allExercises }: WorkoutLoggerProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [formStates, setFormStates] = useState<Record<string, FormState>>({})
  const [exerciseFilter, setExerciseFilter] = useState('')
  const [popoverOpen, setPopoverOpen] = useState(false)

  function getForm(id: string): FormState {
    return formStates[id] ?? defaultForm
  }

  function setForm(id: string, updates: Partial<FormState>) {
    setFormStates((prev) => ({
      ...prev,
      [id]: { ...(prev[id] ?? defaultForm), ...updates },
    }))
  }

  function handleAddSet(exerciseWithDetails: WorkoutExerciseWithDetails) {
    const { workoutExercise, sets } = exerciseWithDetails
    const form = getForm(workoutExercise.id)
    const setNumber = sets.length + 1

    startTransition(async () => {
      await logSetAction(workoutExercise.id, {
        reps: form.reps ? parseInt(form.reps) : undefined,
        weightKg: form.weightKg || undefined,
        durationSeconds: form.durationSeconds ? parseInt(form.durationSeconds) : undefined,
        setNumber,
      })
      setForm(workoutExercise.id, defaultForm)
      router.refresh()
    })
  }

  function handleAddExercise(exercise: Exercise) {
    startTransition(async () => {
      await addExerciseAction(workout.id, exercise.id)
      setExerciseFilter('')
      setPopoverOpen(false)
      router.refresh()
    })
  }

  function handleDeleteSet(setId: string) {
    startTransition(async () => {
      await deleteSetAction(setId)
      router.refresh()
    })
  }

  const filteredExercises = allExercises.filter((e) =>
    e.name.toLowerCase().includes(exerciseFilter.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {workout.exercises.length === 0 ? (
        <p className="text-sm text-muted-foreground">No exercises added yet.</p>
      ) : (
        workout.exercises.map((exerciseWithDetails) => (
          <ExerciseCard
            key={exerciseWithDetails.workoutExercise.id}
            exerciseWithDetails={exerciseWithDetails}
            form={getForm(exerciseWithDetails.workoutExercise.id)}
            onFormChange={(updates) =>
              setForm(exerciseWithDetails.workoutExercise.id, updates)
            }
            onAddSet={() => handleAddSet(exerciseWithDetails)}
            onDeleteSet={handleDeleteSet}
            isPending={isPending}
          />
        ))
      )}

      <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" disabled={isPending}>
            <Plus className="size-4 mr-2" />
            Add Exercise
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-72 p-2" align="start">
          <Input
            placeholder="Search exercises..."
            value={exerciseFilter}
            onChange={(e) => setExerciseFilter(e.target.value)}
            className="mb-2"
          />
          <div className="max-h-60 overflow-y-auto space-y-0.5">
            {filteredExercises.length === 0 ? (
              <p className="text-sm text-muted-foreground px-2 py-1">No exercises found.</p>
            ) : (
              filteredExercises.map((exercise) => (
                <Button
                  key={exercise.id}
                  variant="ghost"
                  className="w-full justify-start text-sm font-normal"
                  onClick={() => handleAddExercise(exercise)}
                  disabled={isPending}
                >
                  {exercise.name}
                </Button>
              ))
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}

interface ExerciseCardProps {
  exerciseWithDetails: WorkoutExerciseWithDetails
  form: FormState
  onFormChange: (updates: Partial<FormState>) => void
  onAddSet: () => void
  onDeleteSet: (setId: string) => void
  isPending: boolean
}

function ExerciseCard({
  exerciseWithDetails,
  form,
  onFormChange,
  onAddSet,
  onDeleteSet,
  isPending,
}: ExerciseCardProps) {
  const { exercise, sets } = exerciseWithDetails

  const hasReps = sets.some((s) => s.reps !== null)
  const hasWeight = sets.some((s) => s.weight_kg !== null)
  const hasDuration = sets.some((s) => s.duration_seconds !== null)

  const canAddSet = form.reps !== '' || form.weightKg !== '' || form.durationSeconds !== ''

  return (
    <div className="space-y-3 border-b pb-6 last:border-b-0">
      <h3 className="font-medium">{exercise.name}</h3>

      {sets.length > 0 && (
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="h-8 w-12 text-xs">Set</TableHead>
              {hasReps && <TableHead className="h-8 text-xs">Reps</TableHead>}
              {hasWeight && <TableHead className="h-8 text-xs">Weight (kg)</TableHead>}
              {hasDuration && <TableHead className="h-8 text-xs">Duration</TableHead>}
              <TableHead className="h-8 w-10 text-xs" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {sets.map((set) => (
              <TableRow key={set.id} className="hover:bg-transparent">
                <TableCell className="py-1.5 text-sm font-medium text-muted-foreground">
                  {set.set_number}
                </TableCell>
                {hasReps && (
                  <TableCell className="py-1.5 text-sm">
                    {set.reps ?? <span className="text-muted-foreground">—</span>}
                  </TableCell>
                )}
                {hasWeight && (
                  <TableCell className="py-1.5 text-sm">
                    {set.weight_kg !== null ? (
                      `${set.weight_kg} kg`
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                )}
                {hasDuration && (
                  <TableCell className="py-1.5 text-sm">
                    {set.duration_seconds !== null ? (
                      `${set.duration_seconds}s`
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                )}
                <TableCell className="py-1.5">
                  <button
                    onClick={() => onDeleteSet(set.id)}
                    disabled={isPending}
                    className="text-muted-foreground hover:text-destructive disabled:opacity-50 transition-colors"
                    aria-label="Delete set"
                  >
                    ×
                  </button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <div className="flex items-end gap-2 flex-wrap">
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Reps</Label>
          <Input
            type="number"
            placeholder="—"
            value={form.reps}
            onChange={(e) => onFormChange({ reps: e.target.value })}
            className="h-8 w-20 text-sm"
            min={1}
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Weight (kg)</Label>
          <Input
            type="number"
            placeholder="—"
            value={form.weightKg}
            onChange={(e) => onFormChange({ weightKg: e.target.value })}
            className="h-8 w-24 text-sm"
            min={0}
            step={0.5}
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Duration (s)</Label>
          <Input
            type="number"
            placeholder="—"
            value={form.durationSeconds}
            onChange={(e) => onFormChange({ durationSeconds: e.target.value })}
            className="h-8 w-24 text-sm"
            min={1}
          />
        </div>
        <Button
          size="sm"
          onClick={onAddSet}
          disabled={isPending || !canAddSet}
        >
          Add Set
        </Button>
      </div>
    </div>
  )
}
