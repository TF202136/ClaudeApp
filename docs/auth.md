# Authentication

This app uses [Clerk](https://clerk.com) for all authentication and user management. Do not implement custom auth, sessions, JWTs, or any third-party auth library — Clerk is the single source of truth.

## Setup

Clerk is configured via environment variables:

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...
```

Optional redirect overrides:

```env
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard
```

## Wrapping the App

The root layout (`app/layout.tsx`) must wrap the app in `<ClerkProvider>`:

```tsx
import { ClerkProvider } from '@clerk/nextjs'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body>{children}</body>
      </html>
    </ClerkProvider>
  )
}
```

## Protecting Routes

Use Clerk's `clerkMiddleware` in `middleware.ts` at the project root. Mark routes as protected with `auth().protect()` or use `createRouteMatcher` for pattern-based protection:

```ts
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

const isProtectedRoute = createRouteMatcher(['/dashboard(.*)'])

export default clerkMiddleware((auth, req) => {
  if (isProtectedRoute(req)) auth().protect()
})

export const config = {
  matcher: ['/((?!_next|.*\\..*).*)'],
}
```

Never manually check for session tokens or cookies — rely on `auth().protect()` and Clerk hooks.

## Accessing Auth State

### Server Components / Route Handlers / Server Actions

Use `auth()` from `@clerk/nextjs/server`:

```ts
import { auth, currentUser } from '@clerk/nextjs/server'

// Get userId only (lightweight)
const { userId } = await auth()

// Get full user object (makes a network request)
const user = await currentUser()
```

### Client Components

Use Clerk's React hooks:

```tsx
import { useAuth, useUser } from '@clerk/nextjs'

const { isLoaded, isSignedIn, userId } = useAuth()
const { user } = useUser()
```

## Sign In / Sign Up UI

Use Clerk's prebuilt components — do not build custom auth forms:

```tsx
import { SignIn, SignUp, SignInButton, SignOutButton, UserButton } from '@clerk/nextjs'

// Full-page flows
<SignIn />
<SignUp />

// Inline buttons
<SignInButton />
<SignOutButton />

// User avatar / account menu
<UserButton afterSignOutUrl="/" />
```

## User Identity in the Database

When associating app data with a user, store Clerk's `userId` (e.g. `user_2abc...`) as the foreign key — never store emails or usernames as identifiers since those can change. Use Clerk webhooks (`user.created`, `user.updated`, `user.deleted`) to sync user records to the database.

## Rules

- All auth logic goes through Clerk — no custom sessions, no NextAuth, no Passport.
- Never expose `CLERK_SECRET_KEY` to the client.
- Never read `userId` from request bodies or query params — always derive it from `auth()` on the server.
- Unauthenticated access to protected data must return `401`, not an empty response.
