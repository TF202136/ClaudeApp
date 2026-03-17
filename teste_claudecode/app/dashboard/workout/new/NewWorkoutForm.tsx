'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { CalendarIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { createWorkoutAction } from './actions'

// ─── DateTimePicker ──────────────────────────────────────────────────────────

interface DateTimePickerProps {
  label: string
  value: Date | undefined
  onChange: (date: Date | undefined) => void
  required?: boolean
}

function DateTimePicker({ label, value, onChange, required }: DateTimePickerProps) {
  const [open, setOpen] = useState(false)

  const hours = value ? String(value.getHours()).padStart(2, '0') : '00'
  const minutes = value ? String(value.getMinutes()).padStart(2, '0') : '00'

  function handleDaySelect(day: Date | undefined) {
    if (!day) {
      onChange(undefined)
      return
    }
    const next = new Date(day)
    next.setHours(value ? value.getHours() : 0)
    next.setMinutes(value ? value.getMinutes() : 0)
    next.setSeconds(0)
    next.setMilliseconds(0)
    onChange(next)
  }

  function handleTimeChange(field: 'hours' | 'minutes', raw: string) {
    const num = Math.max(
      0,
      Math.min(field === 'hours' ? 23 : 59, parseInt(raw || '0', 10))
    )
    const base = value ?? new Date()
    const next = new Date(base)
    if (field === 'hours') next.setHours(num)
    else next.setMinutes(num)
    next.setSeconds(0)
    next.setMilliseconds(0)
    onChange(next)
  }

  return (
    <div className="space-y-2">
      <Label>
        {label}
        {required && <span className="ml-1 text-destructive">*</span>}
      </Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              'w-full justify-start text-left font-normal',
              !value && 'text-muted-foreground'
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
            {value ? format(value, 'PPP, HH:mm') : 'Pick a date and time'}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={value}
            onSelect={handleDaySelect}
          />
          <div className="border-t px-3 pb-3 pt-2">
            <p className="mb-2 text-xs font-medium text-muted-foreground">
              Time
            </p>
            <div className="flex items-center gap-2">
              <div className="flex flex-col gap-1">
                <Label className="text-xs text-muted-foreground">HH</Label>
                <Input
                  className="w-14 text-center"
                  type="number"
                  min={0}
                  max={23}
                  value={hours}
                  onChange={(e) => handleTimeChange('hours', e.target.value)}
                />
              </div>
              <span className="mt-5 text-muted-foreground">:</span>
              <div className="flex flex-col gap-1">
                <Label className="text-xs text-muted-foreground">MM</Label>
                <Input
                  className="w-14 text-center"
                  type="number"
                  min={0}
                  max={59}
                  value={minutes}
                  onChange={(e) => handleTimeChange('minutes', e.target.value)}
                />
              </div>
              <Button
                size="sm"
                className="mt-5"
                variant="secondary"
                onClick={() => setOpen(false)}
              >
                Done
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}

// ─── NewWorkoutForm ───────────────────────────────────────────────────────────

export default function NewWorkoutForm() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const [name, setName] = useState('')
  const [startedAt, setStartedAt] = useState<Date | undefined>(undefined)
  const [completedAt, setCompletedAt] = useState<Date | undefined>(undefined)

  const isValid = name.trim().length > 0 && startedAt !== undefined

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!isValid) return

    setError(null)
    startTransition(async () => {
      const result = await createWorkoutAction({
        name: name.trim(),
        started_at: startedAt!,
        completed_at: completedAt,
      })
      if (result && 'error' in result) {
        setError('Please check your inputs and try again.')
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Workout name */}
      <div className="space-y-2">
        <Label htmlFor="name">
          Workout Name <span className="text-destructive">*</span>
        </Label>
        <Input
          id="name"
          type="text"
          placeholder="e.g. Morning Push Session"
          maxLength={255}
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      {/* Start date & time */}
      <DateTimePicker
        label="Start Date & Time"
        value={startedAt}
        onChange={setStartedAt}
        required
      />

      {/* End date & time (optional) */}
      <DateTimePicker
        label="End Date & Time (optional)"
        value={completedAt}
        onChange={setCompletedAt}
      />

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex gap-3 pt-1">
        <Button type="submit" disabled={isPending || !isValid}>
          {isPending ? 'Creating…' : 'Create Workout'}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isPending}
        >
          Cancel
        </Button>
      </div>
    </form>
  )
}
