import { db } from "@/app/db";
import { exercises } from "@/app/db/schema";
import type { Exercise } from "@/app/db/schema";
import { or, isNull, eq, asc } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";

export async function getExercises(): Promise<Exercise[]> {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  return db
    .select()
    .from(exercises)
    .where(or(isNull(exercises.user_id), eq(exercises.user_id, userId)))
    .orderBy(asc(exercises.name));
}
