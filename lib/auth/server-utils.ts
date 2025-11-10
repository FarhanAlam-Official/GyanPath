import { createClient } from "@/lib/supabase/server"
import { cache } from "react"
import { User } from "@supabase/supabase-js"
import { UserProfile, UserRole, ServerAuthResult } from "./types"

/**
 * Server-side authentication utilities
 *
 * These functions are cached and designed for use in:
 * - Server components
 * - API routes
 * - Middleware
 * - Server actions
 */

/**
 * Get the current authenticated user (server-side)
 * Cached for performance
 */
export const getCurrentUser = cache(async (): Promise<User | null> => {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()

    if (error) {
      console.error("Error getting user:", error)
      return null
    }

    return user
  } catch (error) {
    console.error("Error in getCurrentUser:", error)
    return null
  }
})

/**
 * Get the current user's profile (server-side)
 * Cached for performance
 */
export const getCurrentProfile = cache(async (): Promise<UserProfile | null> => {
  try {
    const user = await getCurrentUser()
    if (!user) return null

    const supabase = await createClient()
    const { data: profile, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single()

    if (error) {
      console.error("Error getting profile:", error)
      return null
    }

    return profile as UserProfile
  } catch (error) {
    console.error("Error in getCurrentProfile:", error)
    return null
  }
})

/**
 * Check if current user is admin
 */
export const isAdmin = cache(async (): Promise<boolean> => {
  const profile = await getCurrentProfile()
  return profile?.role === "admin"
})

/**
 * Check if current user is instructor or admin
 */
export const isInstructor = cache(async (): Promise<boolean> => {
  const profile = await getCurrentProfile()
  return profile?.role === "instructor" || profile?.role === "admin"
})

/**
 * Check if current user is group admin or admin
 */
export const isGroupAdmin = cache(async (): Promise<boolean> => {
  const profile = await getCurrentProfile()
  return profile?.role === "group_admin" || profile?.role === "admin"
})

/**
 * Check if current user has specific role
 */
export const hasRole = cache(async (role: UserRole): Promise<boolean> => {
  const profile = await getCurrentProfile()
  return profile?.role === role
})

/**
 * Check if current user has any of the specified roles
 */
export const hasAnyRole = cache(async (roles: UserRole[]): Promise<boolean> => {
  const profile = await getCurrentProfile()
  return profile ? roles.includes(profile.role) : false
})

/**
 * Require authentication - throws if not authenticated
 * Use in server components/actions that require auth
 */
export const requireAuth = cache(async (): Promise<ServerAuthResult> => {
  const user = await getCurrentUser()
  const profile = await getCurrentProfile()

  if (!user) {
    return {
      user: null,
      profile: null,
      error: "Authentication required",
    }
  }

  return { user, profile }
})

/**
 * Require admin access - throws if not admin
 */
export const requireAdmin = cache(async (): Promise<ServerAuthResult> => {
  const { user, profile, error } = await requireAuth()

  if (error) {
    return { user: null, profile: null, error }
  }

  if (profile?.role !== "admin") {
    return {
      user: null,
      profile: null,
      error: "Admin access required",
    }
  }

  return { user, profile }
})

/**
 * Require instructor access (instructor or admin)
 */
export const requireInstructor = cache(async (): Promise<ServerAuthResult> => {
  const { user, profile, error } = await requireAuth()

  if (error) {
    return { user: null, profile: null, error }
  }

  const hasAccess = profile?.role === "instructor" || profile?.role === "admin"
  if (!hasAccess) {
    return {
      user: null,
      profile: null,
      error: "Instructor access required",
    }
  }

  return { user, profile }
})

/**
 * Require group admin access (group_admin or admin)
 */
export const requireGroupAdmin = cache(async (): Promise<ServerAuthResult> => {
  const { user, profile, error } = await requireAuth()

  if (error) {
    return { user: null, profile: null, error }
  }

  const hasAccess = profile?.role === "group_admin" || profile?.role === "admin"
  if (!hasAccess) {
    return {
      user: null,
      profile: null,
      error: "Group admin access required",
    }
  }

  return { user, profile }
})

/**
 * Require specific role access
 */
export const requireRole = cache(async (requiredRole: UserRole): Promise<ServerAuthResult> => {
  const { user, profile, error } = await requireAuth()

  if (error) {
    return { user: null, profile: null, error }
  }

  // Admin has access to everything
  if (profile?.role === "admin") {
    return { user, profile }
  }

  if (profile?.role !== requiredRole) {
    return {
      user: null,
      profile: null,
      error: `${requiredRole} access required`,
    }
  }

  return { user, profile }
})

/**
 * Require any of the specified roles
 */
export const requireAnyRole = cache(async (roles: UserRole[]): Promise<ServerAuthResult> => {
  const { user, profile, error } = await requireAuth()

  if (error) {
    return { user: null, profile: null, error }
  }

  const hasAccess = profile ? roles.includes(profile.role) : false
  if (!hasAccess) {
    return {
      user: null,
      profile: null,
      error: `One of these roles required: ${roles.join(", ")}`,
    }
  }

  return { user, profile }
})

/**
 * Get user by ID (admin only)
 */
export const getUserById = cache(async (userId: string): Promise<User | null> => {
  const isUserAdmin = await isAdmin()
  if (!isUserAdmin) {
    throw new Error("Admin access required")
  }

  try {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.admin.getUserById(userId)

    if (error) {
      console.error("Error getting user by ID:", error)
      return null
    }

    return data.user
  } catch (error) {
    console.error("Error in getUserById:", error)
    return null
  }
})

/**
 * Get profile by user ID
 */
export const getProfileById = cache(async (userId: string): Promise<UserProfile | null> => {
  try {
    const supabase = await createClient()
    const { data: profile, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single()

    if (error) {
      console.error("Error getting profile by ID:", error)
      return null
    }

    return profile as UserProfile
  } catch (error) {
    console.error("Error in getProfileById:", error)
    return null
  }
})

/**
 * Check if user owns a resource or is admin
 */
export const canAccessResource = cache(async (resourceUserId: string): Promise<boolean> => {
  const user = await getCurrentUser()
  if (!user) return false

  // User owns the resource
  if (user.id === resourceUserId) return true

  // Or user is admin
  const userIsAdmin = await isAdmin()
  return userIsAdmin
})

/**
 * Validate session and return user info
 * Useful for API routes
 */
export const validateSession = async (): Promise<{
  user: User | null
  profile: UserProfile | null
  valid: boolean
  error?: string
}> => {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return {
        user: null,
        profile: null,
        valid: false,
        error: "No authenticated user",
      }
    }

    const profile = await getCurrentProfile()

    return {
      user,
      profile,
      valid: true,
    }
  } catch (error) {
    return {
      user: null,
      profile: null,
      valid: false,
      error: error instanceof Error ? error.message : "Session validation failed",
    }
  }
}
