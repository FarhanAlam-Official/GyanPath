# Authentication Flow Debug Guide

## Changes Made

I've added comprehensive console logging throughout the authentication flow to help diagnose the login redirect issue. Additionally, I've made a critical fix to use hard navigation instead of Next.js router navigation after login.

## Key Changes

### 1. Login Page (`app/auth/login/page.tsx`)

- Added detailed logging at each step of the login process
- **CRITICAL FIX**: Changed from `router.push("/learner")` to `window.location.href = "/learner"`
  - This ensures a hard navigation that properly includes cookies in the request
  - Previous soft navigation (router.push) was causing the middleware to not see the session
- Increased delay after login from 1.3s to 1.5s to ensure session cookies are fully set

### 2. Auth Context (`lib/auth/context.tsx`)

- Added logging for:
  - Sign in process start and completion
  - Session data received from Supabase
  - Remember me preferences
  - Profile fetching
  - Auth state changes (SIGNED_IN, SIGNED_OUT, TOKEN_REFRESHED)
  - Initial auth state initialization

### 3. Middleware (`lib/supabase/middleware.ts`)

- Added logging for:
  - Each request being processed
  - Session preference checks
  - User authentication status
  - Path checks (public vs protected)
  - Redirect decisions

### 4. Learner Dashboard (`app/learner/page.tsx`)

- Added logging for:
  - Server-side user check
  - Profile fetch and validation
  - Data loading status

## What the Logs Will Show

When you attempt to login, you should see a sequence like this in the browser console:

```bash
[LOGIN] Starting login process for: user@example.com
[LOGIN] Calling signIn...
[AUTH CONTEXT] Starting signIn for: user@example.com rememberMe: false
[AUTH CONTEXT] Calling supabase.auth.signInWithPassword...
[AUTH CONTEXT] Sign in successful! Session: { hasUser: true, hasSession: true, userId: "..." }
[AUTH CONTEXT] Setting remember me preferences...
[AUTH CONTEXT] Updating local user state...
[AUTH CONTEXT] Fetching user profile...
[AUTH CONTEXT] Profile fetched: { hasProfile: true, role: "learner" }
[AUTH CONTEXT] Sign in complete, returning success
[LOGIN] SignIn result: { success: true, hasError: false }
[LOGIN] Login successful! Checking session...
[LOGIN] Waiting for session to stabilize...
[LOGIN] Performing hard navigation to /learner...
```

And in the browser console (after navigation):

```bash
[MIDDLEWARE] Processing request: /learner
[MIDDLEWARE] Session preferences: { rememberMe: false, sessionLifetime: 3600 }
[MIDDLEWARE] Getting user from session...
[MIDDLEWARE] User check result: { hasUser: true, userId: "..." }
[MIDDLEWARE] Path check: { path: "/learner", isPublicPath: false }
[MIDDLEWARE] Allowing request to proceed
```

And in the server logs (Node terminal):

```bash
[LEARNER PAGE] Starting to render learner dashboard
[LEARNER PAGE] Getting user from server client...
[LEARNER PAGE] User check result: { hasUser: true, userId: "..." }
[LEARNER PAGE] Fetching user profile...
[LEARNER PAGE] Profile result: { hasProfile: true, role: "learner" }
[LEARNER PAGE] Fetching enrollment count...
[LEARNER PAGE] Rendering dashboard with data: { enrolledCount: X, enrolledCourseIds: Y }
```

## What Was Wrong

The issue was likely caused by:

1. **Race Condition**: Using `router.push()` with `router.refresh()` was causing a race condition where:
   - Login succeeds on client
   - Router tries to navigate
   - But the cookies haven't been fully sent/received by the server yet
   - Server-side middleware doesn't see the session
   - User gets redirected back to login

2. **Solution**: Using `window.location.href` forces a full page reload which:
   - Ensures all cookies are properly sent with the request
   - Gives the server time to recognize the session
   - Properly triggers server-side authentication check

## Testing Steps

1. Open the browser console (F12)
2. Clear all cookies and local storage
3. Try to login
4. Watch the console logs for the sequence above
5. If you still see redirect issues, check:
   - Are cookies being set? (Application tab > Cookies)
   - Look for cookies starting with `sb-`
   - Check if `sb-session-preference` is set if you checked "Remember me"

## Expected Behavior After Fix

After login:

1. Success toast appears
2. Brief delay (1.5s)
3. Hard navigation to `/learner`
4. User should stay on `/learner` and see their dashboard
5. No redirect back to login page

## If Still Not Working

If you still see issues after this fix, check the logs for:

1. **Missing User in Middleware**: If middleware shows `hasUser: false`, the session cookies aren't being sent
2. **Missing User in Server Page**: If server page shows `hasUser: false`, the server-side client can't read the session
3. **Profile Not Found**: If profile fetch fails, check if the profile was created during signup
4. **Wrong Role**: If profile.role is not "learner", you'll be redirected

Look for any error messages in the console that indicate where the flow breaks.
