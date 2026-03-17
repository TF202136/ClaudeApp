"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import WorkoutCard from "./WorkoutCard";
import type { WorkoutWithDetails } from "@/data/workouts";

interface WorkoutsListProps {
  workouts: WorkoutWithDetails[];
  selectedDate: Date;
}

export default function WorkoutsList({ workouts, selectedDate }: WorkoutsListProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="space-y-2">
        <label className="text-sm font-medium">Date</label>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-full justify-start gap-2 font-normal">
              <CalendarIcon className="size-4 text-muted-foreground" />
              {format(selectedDate, "do MMM yyyy")}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(d) => {
                if (d) {
                  router.push(`/dashboard?date=${format(d, "yyyy-MM-dd")}`);
                  setOpen(false);
                }
              }}
            />
          </PopoverContent>
        </Popover>
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-medium">
          Workouts for {format(selectedDate, "do MMM yyyy")}
        </h2>

        {workouts.length === 0 ? (
          <div className="rounded-lg border border-dashed px-6 py-10 text-center">
            <p className="text-sm text-muted-foreground">No workouts logged for this date.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {workouts.map((workout) => (
              <WorkoutCard key={workout.id} workout={workout} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
