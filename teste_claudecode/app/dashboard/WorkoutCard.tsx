import Link from "next/link";
import { format } from "date-fns";
import { Dumbbell, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { WorkoutWithDetails } from "@/data/workouts";

interface WorkoutCardProps {
  workout: WorkoutWithDetails;
}

function formatDuration(startedAt: Date | null, completedAt: Date | null): string | null {
  if (!startedAt || !completedAt) return null;
  const minutes = Math.round(
    (new Date(completedAt).getTime() - new Date(startedAt).getTime()) / 60000
  );
  if (minutes < 60) return `${minutes}m`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m === 0 ? `${h}h` : `${h}h ${m}m`;
}

export default function WorkoutCard({ workout }: WorkoutCardProps) {
  const duration = formatDuration(workout.started_at, workout.completed_at);
  const startTime = workout.started_at
    ? format(new Date(workout.started_at), "h:mm a")
    : null;

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-2 min-w-0">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-primary/10">
              <Dumbbell className="size-4 text-primary" />
            </div>
            <CardTitle className="truncate text-base">
              <Link
                href={`/dashboard/workout/${workout.id}`}
                className="hover:underline"
              >
                {workout.name ?? "Untitled Workout"}
              </Link>
            </CardTitle>
          </div>
          <div className="flex shrink-0 items-center gap-3 text-sm text-muted-foreground">
            {startTime && <span>{startTime}</span>}
            {duration && (
              <span className="flex items-center gap-1">
                <Clock className="size-3.5" />
                {duration}
              </span>
            )}
            <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium">
              {workout.exercises.length}{" "}
              {workout.exercises.length === 1 ? "exercise" : "exercises"}
            </span>
          </div>
        </div>
      </CardHeader>

      {workout.exercises.length > 0 && (
        <CardContent className="px-0 pb-0">
          <Accordion type="multiple" className="w-full">
            {workout.exercises.map(({ workoutExercise, exercise, sets }) => (
              <AccordionItem
                key={workoutExercise.id}
                value={workoutExercise.id}
                className="border-t border-b-0 px-6 last:border-b"
              >
                <AccordionTrigger className="py-3 text-sm font-medium hover:no-underline">
                  <div className="flex items-center gap-3">
                    <span>{exercise.name}</span>
                    <span className="text-xs font-normal text-muted-foreground">
                      {sets.length} {sets.length === 1 ? "set" : "sets"}
                    </span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pb-3 pt-0">
                  {sets.length === 0 ? (
                    <p className="text-xs text-muted-foreground">No sets logged.</p>
                  ) : (
                    <SetsTable sets={sets} />
                  )}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      )}
    </Card>
  );
}

type DrizzleSet = WorkoutWithDetails["exercises"][number]["sets"][number];

function SetsTable({ sets }: { sets: DrizzleSet[] }) {
  const hasWeight = sets.some((s) => s.weight_kg !== null);
  const hasReps = sets.some((s) => s.reps !== null);
  const hasDuration = sets.some((s) => s.duration_seconds !== null);

  return (
    <Table>
      <TableHeader>
        <TableRow className="hover:bg-transparent">
          <TableHead className="h-8 w-12 text-xs">Set</TableHead>
          {hasReps && <TableHead className="h-8 text-xs">Reps</TableHead>}
          {hasWeight && <TableHead className="h-8 text-xs">Weight</TableHead>}
          {hasDuration && <TableHead className="h-8 text-xs">Duration</TableHead>}
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
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
