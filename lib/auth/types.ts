import { User } from "@supabase/supabase-js"

/**
 * Auth-related TypeScript types and interfaces
 */

export type UserRole = "learner" | "instructor" | "group_admin" | "admin"
export type PreferredLanguage = "en" | "ne"

export interface UserProfile {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  role: UserRole
  preferred_language: PreferredLanguage
  created_at: string
  updated_at: string
  email_verified: boolean
  last_sign_in_at: string | null
  // Additional profile fields
  bio: string | null
  phone: string | null
  location: string | null
}

export interface AuthContextType {
  // State
  user: User | null
  profile: UserProfile | null
  loading: boolean
  
  // Computed values
  isAuthenticated: boolean
  isAdmin: boolean
  isInstructor: boolean
  isGroupAdmin: boolean
  
  // Auth methods
  signIn: (email: string, password: string, rememberMe?: boolean) => Promise<AuthResult>
  signUp: (email: string, password: string, fullName: string, role?: UserRole) => Promise<AuthResult>
  signOut: () => Promise<void>
  
  // Social auth methods
  signInWithGoogle: () => Promise<AuthResult>
  signInWithGithub: () => Promise<AuthResult>
  
  // Email verification
  resendVerificationEmail: (email: string) => Promise<AuthResult>
  
  // Password reset
  resetPasswordForEmail: (email: string) => Promise<AuthResult>
  updatePassword: (newPassword: string) => Promise<AuthResult>
  
  // Profile management
  updateProfile: (updates: Partial<UserProfile>) => Promise<AuthResult>
  refreshProfile: () => Promise<void>
  
  // Utility methods
  testConnection: () => Promise<boolean>
}

export interface AuthResult {
  data?: unknown
  error?: AuthError | null
  success?: boolean
}

export interface AuthError extends Error {
  type?: 'validation' | 'network' | 'auth' | 'rate_limit' | 'email_not_confirmed' | 'server'
  code?: string
  details?: Record<string, unknown>
}

export interface RateLimitConfig {
  maxAttempts: number
  windowMs: number
  blockDuration: number
}

export interface RateLimitResult {
  blocked: boolean
  remainingAttempts?: number
  waitTime?: number
  resetTime?: number
}

export interface SessionPreference {
  rememberMe: boolean
  duration: number
  timestamp: number
}

// Social auth providers
export type SocialProvider = 'google' | 'github'

// Auth event types
export type AuthEvent = 
  | 'SIGNED_IN'
  | 'SIGNED_OUT' 
  | 'TOKEN_REFRESHED'
  | 'USER_UPDATED'

export interface AuthEventHandler {
  event: AuthEvent
  session: User | null
}

// Server-side auth result
export interface ServerAuthResult {
  user: User | null
  profile: UserProfile | null
  error?: string
}

// Protected route options
export interface ProtectedRouteOptions {
  requireAuth?: boolean
  requireRole?: UserRole | UserRole[]
  redirectTo?: string
  fallback?: React.ComponentType
}