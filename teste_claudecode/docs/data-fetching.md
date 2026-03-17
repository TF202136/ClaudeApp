# Data Fetching

## CRITICAL RULE: Server Components Only

**ALL data fetching MUST be done exclusively via React Server Components.**

Data must NEVER be fetched via:
- Route handlers (`app/api/` endpoints)
- Client components (`"use client"`)
- Third-party client-side data fetching libraries (SWR, React Query, etc.)
- `useEffect` + `fetch`

If you need data in a client component, fetch it in a server component parent and pass it down as props.

## Database Access: `/data` Directory

All database queries MUST go through helper functions located in the `/data` directory.

Rules:
- Every database operation must have a corresponding helper function in `/data`
- Helper functions MUST use **Drizzle ORM** — never write raw SQL
- Raw SQL (`sql`, `db.execute`, template literals with SQL strings) is strictly forbidden

Example structure:
```
data/
  users.ts
  posts.ts
  subscriptions.ts
```

Example helper function:
```ts
// data/posts.ts
import { db } from "@/lib/db";
import { posts } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";

export async function getUserPosts() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  return db.select().from(posts).where(eq(posts.userId, session.user.id));
}
```

## Security: User Data Isolation

**A logged-in user MUST only ever be able to access their own data.**

Every helper function in `/data` that returns user-specific data MUST:

1. Retrieve the current session inside the function (do not accept `userId` as a parameter from the caller)
2. Throw or return `null` if the user is not authenticated
3. Always filter queries by the authenticated user's ID

**Wrong — trusts caller-supplied ID:**
```ts
// NEVER do this
export async function getPost(postId: string, userId: string) {
  return db.select().from(posts).where(eq(posts.id, postId));
}
```

**Correct — enforces ownership internally:**
```ts
export async function getPost(postId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const [post] = await db
    .select()
    .from(posts)
    .where(and(eq(posts.id, postId), eq(posts.userId, session.user.id)));

  return post ?? null;
}
```

Filtering by both the resource ID **and** the authenticated user's ID ensures a user cannot access another user's data even by guessing or manipulating IDs.

## Summary Checklist

- [ ] Data is fetched in a Server Component
- [ ] No `fetch`/query calls inside `"use client"` components
- [ ] No route handlers used for data fetching
- [ ] Query is in a helper function under `/data`
- [ ] Helper function uses Drizzle ORM (no raw SQL)
- [ ] Helper function resolves the session internally and filters by the authenticated user's ID
