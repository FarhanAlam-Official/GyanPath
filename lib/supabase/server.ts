import { createServerClient as createSupabaseServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

const SESSION_DURATION = {
  DEFAULT: 60 * 60, // 1 hour in seconds
  REMEMBER_ME: 30 * 24 * 60 * 60, // 30 days in seconds
}

export async function createClient() {
  const cookieStore = await cookies()

  // Check if session preference cookie is set
  const sessionPrefCookie = cookieStore.get("sb-session-preference")
  const rememberMe = sessionPrefCookie?.value === "remember_me"
  const sessionLifetime = rememberMe ? SESSION_DURATION.REMEMBER_ME : SESSION_DURATION.DEFAULT

  return createSupabaseServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              // Override maxAge for auth cookies when remember_me is enabled
              if (name.includes("auth-token") && rememberMe) {
                cookieStore.set(name, value, {
                  ...options,
                  maxAge: sessionLifetime,
                  expires: new Date(Date.now() + sessionLifetime * 1000),
                })
              } else {
                cookieStore.set(name, value, options)
              }
            })
          } catch {
            // The "setAll" method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )
}

export const createServerClient = createClient
