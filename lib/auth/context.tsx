"use client"

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from "react"
import { useRouter } from "next/navigation"
import { User } from "@supabase/supabase-js"
import { createClient } from "@/lib/supabase/client"
import { notifications } from "@/lib/notifications"
import { setSessionPreference, clearSessionPreference } from "@/lib/auth/session"
import { AuthContextType, UserProfile, AuthResult, AuthError, UserRole } from "./types"
import {
  signInRateLimiter,
  signUpRateLimiter,
  emailVerificationRateLimiter,
  passwordResetRateLimiter,
} from "./rate-limiter"

// Create the context
const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: React.ReactNode
}

/**
 * Enhanced Auth Provider Component
 *
 * Provides centralized authentication state management with:
 * - User authentication state
 * - Profile management
 * - Rate limiting for security
 * - Social authentication
 * - Email verification
 * - Remember me functionality
 * - Role-based access control
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const isInitializedRef = useRef(false)

  const supabase = createClient()

  /**
   * Fetch user profile from database
   */
  const fetchProfile = useCallback(
    async (userId: string): Promise<UserProfile | null> => {
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", userId)
          .single()

        if (error) {
          return null
        }

        // Cache the profile in sessionStorage for faster subsequent loads
        if (typeof window !== "undefined" && data) {
          sessionStorage.setItem(`profile_${userId}`, JSON.stringify(data))
        }

        return data as UserProfile
      } catch {
        return null
      }
    },
    [supabase]
  )

  /**
   * Get cached profile or fetch from database
   */
  const getProfile = useCallback(
    async (userId: string): Promise<UserProfile | null> => {
      // Try to get from cache first
      if (typeof window !== "undefined") {
        const cached = sessionStorage.getItem(`profile_${userId}`)
        if (cached) {
          try {
            const profileData = JSON.parse(cached) as UserProfile
            return profileData
          } catch {
            // Invalid cache, remove it
            sessionStorage.removeItem(`profile_${userId}`)
          }
        }
      }

      // No cache, fetch from database
      return await fetchProfile(userId)
    },
    [fetchProfile]
  )

  /**
   * Update user profile
   */
  const updateProfile = useCallback(
    async (updates: Partial<UserProfile>): Promise<AuthResult> => {
      if (!user) {
        return {
          error: {
            name: "AuthError",
            message: "No authenticated user",
            type: "auth",
          } as AuthError,
        }
      }

      try {
        const { data, error } = await supabase
          .from("profiles")
          .update(updates)
          .eq("id", user.id)
          .select()
          .single()

        if (error) {
          return {
            error: {
              name: "ProfileUpdateError",
              message: error.message,
              type: "server",
            } as AuthError,
          }
        }

        setProfile(data as UserProfile)
        return { success: true, data }
      } catch (error) {
        return {
          error: {
            name: "ProfileUpdateError",
            message: error instanceof Error ? error.message : "Failed to update profile",
            type: "server",
          } as AuthError,
        }
      }
    },
    [user, supabase]
  )

  /**
   * Refresh user profile
   */
  const refreshProfile = useCallback(async (): Promise<void> => {
    if (!user) return

    // Force fetch from database (bypass cache)
    const profileData = await fetchProfile(user.id)
    setProfile(profileData)
  }, [user, fetchProfile])

  /**
   * Create auth error with proper typing
   */
  const createAuthError = (message: string, type: AuthError["type"] = "auth"): AuthError => ({
    name: "AuthError",
    message,
    type,
  })

  /**
   * Sign in with email and password
   */
  const signIn = useCallback(
    async (email: string, password: string, rememberMe: boolean = false): Promise<AuthResult> => {
      try {
        const rateLimitKey = `signin_${email.toLowerCase()}`

        // Check rate limiting
        const rateLimitResult = signInRateLimiter.recordAttempt(rateLimitKey)
        if (rateLimitResult.blocked) {
          const waitTime = signInRateLimiter.formatWaitTime(rateLimitResult.waitTime || 0)
          return {
            error: createAuthError(
              `Too many failed attempts. Please try again in ${waitTime}.`,
              "rate_limit"
            ),
          }
        }

        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })

        if (error) {
          // Handle email not confirmed case specially
          if (error.message.includes("Email not confirmed")) {
            return {
              error: createAuthError(
                "Please verify your email address before logging in.",
                "email_not_confirmed"
              ),
            }
          }

          // Provide user-friendly error messages
          let message = "Login failed. Please try again."
          if (error.message.includes("Invalid login credentials")) {
            message = "Invalid email or password. Please check your credentials and try again."
          } else {
            message = error.message
          }

          return { error: createAuthError(message) }
        }

        // Clear rate limiting on successful login
        signInRateLimiter.clearAttempts(rateLimitKey)

        // Handle remember me functionality
        if (rememberMe) {
          localStorage.setItem("rememberedEmail", email)
          localStorage.setItem("rememberMe", "true")
          setSessionPreference(true)

          // Set cookie for server-side session duration
          const secureFlag = process.env.NODE_ENV === "production" ? "; Secure" : ""
          document.cookie = `sb-session-preference=remember_me; path=/; max-age=${30 * 24 * 60 * 60}; SameSite=Lax${secureFlag}`
        } else {
          localStorage.removeItem("rememberedEmail")
          localStorage.removeItem("rememberMe")
          clearSessionPreference()
          document.cookie = `sb-session-preference=; path=/; max-age=0; SameSite=Lax`
        }

        setUser(data.user)

        if (data.user) {
          const profileData = await getProfile(data.user.id)
          setProfile(profileData)
        }

        return { success: true, data }
      } catch (error) {
        return {
          error: createAuthError(
            error instanceof Error ? error.message : "Failed to sign in",
            "network"
          ),
        }
      }
    },
    [supabase, getProfile]
  )

  /**
   * Sign up with email, password, and profile information
   */
  const signUp = useCallback(
    async (
      email: string,
      password: string,
      fullName: string,
      role: UserRole = "learner"
    ): Promise<AuthResult> => {
      try {
        const rateLimitKey = `signup_${email.toLowerCase()}`

        // Check rate limiting
        const rateLimitResult = signUpRateLimiter.recordAttempt(rateLimitKey)
        if (rateLimitResult.blocked) {
          const waitTime = signUpRateLimiter.formatWaitTime(rateLimitResult.waitTime || 0)
          return {
            error: createAuthError(
              `Too many signup attempts. Please try again in ${waitTime}.`,
              "rate_limit"
            ),
          }
        }

        // Test Supabase connectivity first
        try {
          const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
          const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
          if (!supabaseUrl || !supabaseAnonKey) {
            throw new Error("Supabase environment variables are missing")
          }

          const res = await fetch(`${supabaseUrl}/auth/v1/settings`, {
            headers: {
              apikey: supabaseAnonKey,
              Authorization: `Bearer ${supabaseAnonKey}`,
            },
            credentials: "omit",
            cache: "no-store",
          })
        } catch (netErr) {
          return {
            error: createAuthError(
              "Cannot reach authentication service. Please check your internet connection.",
              "network"
            ),
          }
        }

        const siteUrl =
          process.env.NEXT_PUBLIC_SITE_URL ||
          (typeof window !== "undefined" ? window.location.origin : "")
        const redirectTo = siteUrl
          ? `${siteUrl}/auth/verify`
          : `${window.location.origin}/auth/verify`

        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
              role: role,
              preferred_language: "en",
            },
            emailRedirectTo: redirectTo,
          },
        })

        if (error) {
          // Provide specific error messages
          let message = "Failed to create account. Please try again."
          if (error.message.includes("User already registered")) {
            message = "An account with this email already exists. Please try signing in instead."
          } else if (error.message.includes("Password is too weak")) {
            message = "Password is too weak. Please choose a stronger password."
          } else if (error.message.includes("Email rate limit exceeded")) {
            message = "Too many signup attempts. Please try again later."
          } else {
            message = error.message
          }

          return { error: createAuthError(message) }
        }

        // Clear rate limiting on successful signup
        signUpRateLimiter.clearAttempts(rateLimitKey)

        return { success: true, data }
      } catch (error) {
        return {
          error: createAuthError(
            error instanceof Error ? error.message : "Failed to create account",
            "network"
          ),
        }
      }
    },
    [supabase]
  )

  /**
   * Sign out
   */
  const signOut = useCallback(async (): Promise<void> => {
    try {
      // Clear cached profile before signing out
      if (user?.id && typeof window !== "undefined") {
        sessionStorage.removeItem(`profile_${user.id}`)
      }

      const { error } = await supabase.auth.signOut()

      if (error) {
        throw error
      }

      // Clear state immediately
      setUser(null)
      setProfile(null)

      // Clear session preferences
      clearSessionPreference()
      document.cookie = `sb-session-preference=; path=/; max-age=0; SameSite=Lax`

      notifications.showSuccess("You have been signed out successfully.")

      // Navigate to home page
      if (typeof window !== "undefined") {
        router.push("/")
      }
    } catch (error) {
      notifications.showError({
        title: "Sign Out Error",
        description: error instanceof Error ? error.message : "Failed to sign out",
      })
    }
  }, [supabase, router, user])

  /**
   * Sign in with Google
   */
  const signInWithGoogle = useCallback(async (): Promise<AuthResult> => {
    try {
      const siteUrl =
        process.env.NEXT_PUBLIC_SITE_URL ||
        (typeof window !== "undefined" ? window.location.origin : "")
      const redirectTo = siteUrl
        ? `${siteUrl}/auth/callback`
        : `${window.location.origin}/auth/callback`

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo,
        },
      })

      if (error) {
        return { error: createAuthError(error.message) }
      }

      // OAuth will redirect, so we don't handle success here
      return { success: true, data }
    } catch (error) {
      return {
        error: createAuthError(
          error instanceof Error ? error.message : "Failed to sign in with Google",
          "network"
        ),
      }
    }
  }, [supabase])

  /**
   * Sign in with GitHub
   */
  const signInWithGithub = useCallback(async (): Promise<AuthResult> => {
    try {
      const siteUrl =
        process.env.NEXT_PUBLIC_SITE_URL ||
        (typeof window !== "undefined" ? window.location.origin : "")
      const redirectTo = siteUrl
        ? `${siteUrl}/auth/callback`
        : `${window.location.origin}/auth/callback`

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "github",
        options: {
          redirectTo,
        },
      })

      if (error) {
        return { error: createAuthError(error.message) }
      }

      // OAuth will redirect, so we don't handle success here
      return { success: true, data }
    } catch (error) {
      return {
        error: createAuthError(
          error instanceof Error ? error.message : "Failed to sign in with GitHub",
          "network"
        ),
      }
    }
  }, [supabase])

  /**
   * Resend verification email
   */
  const resendVerificationEmail = useCallback(
    async (email: string): Promise<AuthResult> => {
      try {
        const rateLimitKey = `verify_${email.toLowerCase()}`

        // Check rate limiting
        const rateLimitResult = emailVerificationRateLimiter.recordAttempt(rateLimitKey)
        if (rateLimitResult.blocked) {
          const waitTime = emailVerificationRateLimiter.formatWaitTime(
            rateLimitResult.waitTime || 0
          )
          return {
            error: createAuthError(
              `Too many resend attempts. Please try again in ${waitTime}.`,
              "rate_limit"
            ),
          }
        }

        const siteUrl =
          process.env.NEXT_PUBLIC_SITE_URL ||
          (typeof window !== "undefined" ? window.location.origin : "")
        const redirectTo = siteUrl
          ? `${siteUrl}/auth/verify`
          : `${window.location.origin}/auth/verify`

        const { error } = await supabase.auth.resend({
          type: "signup",
          email: email,
          options: {
            emailRedirectTo: redirectTo,
          },
        })

        if (error) {
          let message = "Failed to resend verification email. Please try again."
          if (
            error.message.includes(
              "For security purposes, you can only request this once every 60 seconds"
            )
          ) {
            message = "Please wait 60 seconds before requesting another verification email."
          } else if (error.message.includes("User not found")) {
            message = "No account found with this email address."
          } else {
            message = error.message
          }

          return { error: createAuthError(message) }
        }

        // Clear rate limiting on success
        emailVerificationRateLimiter.clearAttempts(rateLimitKey)

        return { success: true }
      } catch (error) {
        return {
          error: createAuthError(
            error instanceof Error ? error.message : "Failed to resend verification email",
            "network"
          ),
        }
      }
    },
    [supabase]
  )

  /**
   * Send password reset email
   */
  const resetPasswordForEmail = useCallback(
    async (email: string): Promise<AuthResult> => {
      try {
        const rateLimitKey = `password_reset_${email.toLowerCase()}`

        // Check rate limiting
        const rateLimitResult = passwordResetRateLimiter.recordAttempt(rateLimitKey)
        if (rateLimitResult.blocked) {
          const waitTime = passwordResetRateLimiter.formatWaitTime(rateLimitResult.waitTime || 0)
          return {
            error: createAuthError(
              `Too many password reset attempts. Please try again in ${waitTime}.`,
              "rate_limit"
            ),
          }
        }

        const siteUrl =
          process.env.NEXT_PUBLIC_SITE_URL ||
          (typeof window !== "undefined" ? window.location.origin : "")
        const redirectTo = siteUrl
          ? `${siteUrl}/auth/reset-password`
          : `${window.location.origin}/auth/reset-password`

        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo,
        })

        if (error) {
          let message = "Failed to send password reset email. Please try again."
          if (
            error.message.includes(
              "For security purposes, you can only request this once every 60 seconds"
            )
          ) {
            message = "Please wait 60 seconds before requesting another password reset email."
          } else if (error.message.includes("User not found")) {
            // Don't reveal if user exists or not for security
            message = "If an account exists with this email, a password reset link has been sent."
          } else {
            message = error.message
          }

          return { error: createAuthError(message) }
        }

        // Clear rate limiting on success (but still respect Supabase's rate limit)
        // We don't clear here to prevent abuse, but we could after a successful reset

        return { success: true }
      } catch (error) {
        return {
          error: createAuthError(
            error instanceof Error ? error.message : "Failed to send password reset email",
            "network"
          ),
        }
      }
    },
    [supabase]
  )

  /**
   * Update user password (used after clicking reset link)
   */
  const updatePassword = useCallback(
    async (newPassword: string): Promise<AuthResult> => {
      try {
        if (!newPassword || newPassword.length < 6) {
          return {
            error: createAuthError("Password must be at least 6 characters long.", "validation"),
          }
        }

        const { data, error } = await supabase.auth.updateUser({
          password: newPassword,
        })

        if (error) {
          let message = "Failed to update password. Please try again."
          if (error.message.includes("New password should be different")) {
            message = "New password must be different from your current password."
          } else if (error.message.includes("Password is too weak")) {
            message = "Password is too weak. Please choose a stronger password."
          } else if (error.message.includes("Invalid token")) {
            message = "Password reset link has expired or is invalid. Please request a new one."
          } else {
            message = error.message
          }

          return { error: createAuthError(message) }
        }

        // Clear password reset rate limiting on successful password update
        if (data?.user?.email) {
          const rateLimitKey = `password_reset_${data.user.email.toLowerCase()}`
          passwordResetRateLimiter.clearAttempts(rateLimitKey)
        }

        return { success: true, data }
      } catch (error) {
        return {
          error: createAuthError(
            error instanceof Error ? error.message : "Failed to update password",
            "network"
          ),
        }
      }
    },
    [supabase]
  )

  /**
   * Test connection to Supabase
   */
  const testConnection = useCallback(async (): Promise<boolean> => {
    try {
      const { error } = await supabase.from("profiles").select("id").limit(1)
      return !error
    } catch (error) {
      return false
    }
  }, [supabase])

  // Initialize auth state
  useEffect(() => {
    let mounted = true
    // Reset initialization flag on mount
    isInitializedRef.current = false

    const initializeAuth = async () => {
      try {
        // Get current session
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession()

        if (error) {
          if (mounted) {
            setLoading(false)
            isInitializedRef.current = true
          }
        } else if (session?.user && mounted) {
          setUser(session.user)

          // Fetch profile and wait for it before setting loading to false
          try {
            const profileData = await getProfile(session.user.id)
            if (mounted) {
              setProfile(profileData)
              setLoading(false)
              isInitializedRef.current = true
            }
          } catch (error) {
            if (mounted) {
              // Set loading to false even if profile fetch fails
              // User is authenticated, profile might be missing but that's okay
              setLoading(false)
              isInitializedRef.current = true
            }
          }
        } else {
          // No session, not logged in
          if (mounted) {
            setLoading(false)
            isInitializedRef.current = true
          }
        }
      } catch (error) {
        if (mounted) {
          setLoading(false)
          isInitializedRef.current = true
        }
      }
    }

    initializeAuth()

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return

      // Skip INITIAL_SESSION if we already initialized - avoid duplicate work
      if (event === "INITIAL_SESSION" && isInitializedRef.current) {
        return
      }

      // Auth state changed - handle accordingly
      if (event === "INITIAL_SESSION" && session) {
        // Initial session detected (user already logged in)
        // This should only run if initializeAuth hasn't completed yet
        setUser(session.user)
        try {
          const profileData = await getProfile(session.user.id)
          if (mounted) {
            // Only set profile if we got valid data, don't overwrite with null
            if (profileData) {
              setProfile(profileData)
            }
            setLoading(false)
            isInitializedRef.current = true
          }
        } catch (error) {
          if (mounted) {
            // Ensure loading is set to false even if profile fetch fails
            setLoading(false)
            isInitializedRef.current = true
          }
        }
      } else if (event === "SIGNED_IN" && session) {
        setUser(session.user)
        try {
          const profileData = await getProfile(session.user.id)
          if (mounted) {
            setProfile(profileData)
            setLoading(false)
          }
        } catch (error) {
          if (mounted) {
            // Ensure loading is set to false even if profile fetch fails
            setLoading(false)
          }
        }
      } else if (event === "SIGNED_OUT") {
        setUser(null)
        setProfile(null)
        setLoading(false)
        // Clear cached profile from sessionStorage
        if (typeof window !== "undefined" && session?.user?.id) {
          sessionStorage.removeItem(`profile_${session.user.id}`)
        }
      } else if (event === "TOKEN_REFRESHED" && session) {
        setUser(session.user)
        // Don't refetch profile on token refresh, it hasn't changed
        // Don't change loading state either
      }
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [supabase, fetchProfile, getProfile])

  // Computed values
  const isAuthenticated = !!user
  const isAdmin = profile?.role === "admin"
  const isInstructor = profile?.role === "instructor" || isAdmin
  const isGroupAdmin = profile?.role === "group_admin" || isAdmin

  const contextValue: AuthContextType = {
    // State
    user,
    profile,
    loading,

    // Computed values
    isAuthenticated,
    isAdmin,
    isInstructor,
    isGroupAdmin,

    // Auth methods
    signIn,
    signUp,
    signOut,

    // Social auth methods
    signInWithGoogle,
    signInWithGithub,

    // Email verification
    resendVerificationEmail,

    // Password reset
    resetPasswordForEmail,
    updatePassword,

    // Profile management
    updateProfile,
    refreshProfile,

    // Utility methods
    testConnection,
  }

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
}

/**
 * Hook to use auth context
 */
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

export { AuthContext }
