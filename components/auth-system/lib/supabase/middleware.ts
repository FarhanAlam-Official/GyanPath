import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

export async function updateSession(
  request: NextRequest,
  config?: {
    protectedPaths?: string[]
    adminPaths?: string[]
    moderatorPaths?: string[]
    loginPath?: string
    homePath?: string
  }
) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error("Missing Supabase environment variables in middleware")
    return supabaseResponse
  }

  // Default configuration
  const {
    protectedPaths = ["/admin", "/profile", "/moderator"],
    adminPaths = ["/admin"],
    moderatorPaths = ["/moderator"],
    loginPath = "/auth/login",
    homePath = "/"
  } = config || {}

  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) => supabaseResponse.cookies.set(name, value, options))
        },
      },
    },
  )

  try {
    // Ensure any OAuth/email link callbacks set cookies via exchange
    // Only attempt to exchange code if there's a code parameter
    const code = request.nextUrl.searchParams.get('code')
    if (code) {
      try {
        await supabase.auth.exchangeCodeForSession(code)
      } catch (e) {
        // Safe to ignore if code exchange fails
        console.error("Failed to exchange auth code for session:", e)
      }
    }

    // Refresh session if expired
    const {
      data: { user },
    } = await supabase.auth.getUser()

    // Check if current path is protected
    const isProtectedPath = protectedPaths.some((path) => request.nextUrl.pathname.startsWith(path))
    const isAdminPath = adminPaths.some((path) => request.nextUrl.pathname.startsWith(path))
    const isModeratorPath = moderatorPaths.some((path) => request.nextUrl.pathname.startsWith(path))

    if (isProtectedPath && !user) {
      const url = request.nextUrl.clone()
      url.pathname = loginPath
      url.searchParams.set("redirect", request.nextUrl.pathname)
      return NextResponse.redirect(url)
    }

    // Role-based access control
    if (user && (isAdminPath || isModeratorPath)) {
      const { data: profile, error } = await supabase.from("profiles").select("role").eq("id", user.id).single()

      if (error || !profile) {
        console.error("Error fetching user profile:", error)
        const url = request.nextUrl.clone()
        url.pathname = homePath
        return NextResponse.redirect(url)
      }

      // Admin-only routes
      if (isAdminPath && profile.role !== "admin") {
        const url = request.nextUrl.clone()
        url.pathname = homePath
        return NextResponse.redirect(url)
      }

      // Moderator-only routes (admin can also access)
      if (isModeratorPath && profile.role !== "moderator" && profile.role !== "admin") {
        const url = request.nextUrl.clone()
        url.pathname = homePath
        return NextResponse.redirect(url)
      }
    }
  } catch (error) {
    console.error("Error in middleware:", error)
  }

  return supabaseResponse
}