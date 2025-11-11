import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

const SESSION_DURATION = {
  DEFAULT: 60 * 60, // 1 hour in seconds
  REMEMBER_ME: 30 * 24 * 60 * 60, // 30 days in seconds
}

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  // Check if session preference cookie is set
  const sessionPrefCookie = request.cookies.get("sb-session-preference")
  const rememberMe = sessionPrefCookie?.value === "remember_me"
  const sessionLifetime = rememberMe ? SESSION_DURATION.REMEMBER_ME : SESSION_DURATION.DEFAULT

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) => {
            // Override maxAge for auth cookies when remember_me is enabled
            if (name.includes("auth-token") && rememberMe) {
              supabaseResponse.cookies.set(name, value, {
                ...options,
                maxAge: sessionLifetime,
                expires: new Date(Date.now() + sessionLifetime * 1000),
              })
            } else {
              supabaseResponse.cookies.set(name, value, options)
            }
          })
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const publicPaths = ["/", "/auth", "/verify"]
  const isPublicPath = publicPaths.some((path) => request.nextUrl.pathname.startsWith(path))

  // Redirect unauthenticated users to login only for protected routes
  if (!user && !isPublicPath) {
    const url = request.nextUrl.clone()
    url.pathname = "/auth/login"
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}
