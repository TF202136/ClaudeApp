import Link from "next/link";
import { getUserWorkoutsWithDetails } from "@/data/workouts";
import { Button } from "@/components/ui/button";
import WorkoutsList from "./WorkoutsList";

interface DashboardPageProps {
  searchParams: Promise<{ date?: string }>;
}

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const { date: dateParam } = await searchParams;
  const selectedDate = dateParam ? new Date(dateParam) : new Date();

  const workouts = await getUserWorkoutsWithDetails(selectedDate);

  return (
    <div className="max-w-2xl mx-auto px-6 py-8 space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Dashboard</h1>
          <p className="text-muted-foreground mt-1">View your logged workouts by date.</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/workout/new">Log Workout</Link>
        </Button>
      </div>

      <WorkoutsList workouts={workouts} selectedDate={selectedDate} />
    </div>
  );
}
