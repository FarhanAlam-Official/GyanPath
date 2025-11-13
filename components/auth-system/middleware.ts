import type { NextRequest } from "next/server"
import { updateSession } from "./lib/supabase/middleware"

export async function middleware(request: NextRequest) {
  return await updateSession(request, {
    // Customize these paths according to your application
    protectedPaths: ["/admin", "/profile", "/dashboard"],
    adminPaths: ["/admin"],
    moderatorPaths: ["/moderator"],
    loginPath: "/auth/login",
    homePath: "/"
  })
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
}