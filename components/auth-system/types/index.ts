import { User } from "@supabase/supabase-js"

// User Roles
export type UserRole = "admin" | "moderator" | "viewer"

// Profile type
export interface Profile {
  id: string
  email: string
  full_name: string | null
  role: UserRole
  avatar_url?: string | null
  created_at: string
  updated_at: string
  last_login?: string | null
  is_active: boolean
  // Additional moderator fields
  assigned_sports?: string[] | null
  assigned_venues?: string[] | null
  moderator_notes?: string | null
}

// Auth Context Type
export interface AuthContextType {
  user: User | null
  profile: Profile | null
  signIn: (email: string, password: string, rememberMe?: boolean) => Promise<AuthResponse>
  signInWithGoogle: () => Promise<AuthResponse>
  signInWithGithub: () => Promise<AuthResponse>
  signUp: (email: string, password: string, fullName: string) => Promise<AuthResponse>
  resendVerificationEmail: (email: string) => Promise<AuthResponse>
  signOut: () => Promise<void>
  loading: boolean
  isAdmin: boolean
  isModerator: boolean
  testConnection: () => Promise<boolean>
}

// Auth Response Type
export interface AuthResponse {
  data?: any
  error?: AuthError | null
}

// Auth Error Type
export interface AuthError {
  type?: string
  message: string
  email?: string
}

// Rate Limiter Types
export interface RateLimitConfig {
  maxAttempts: number
  windowMs: number
  blockDuration: number
}

export interface RateLimitResult {
  blocked: boolean
  waitTime?: number
}

// Middleware Config Type
export interface MiddlewareConfig {
  protectedPaths?: string[]
  adminPaths?: string[]
  moderatorPaths?: string[]
  loginPath?: string
  homePath?: string
}

// Server Auth Response Types
export interface ServerAuthResult {
  user: User | null
  profile: Profile | null
}

export interface AdminAuthResult extends ServerAuthResult {
  isAdmin: boolean
}

export interface ModeratorAuthResult extends ServerAuthResult {
  isModerator: boolean
}

// Password Strength Types (from auth-validation)
export interface PasswordRequirements {
  length: boolean
  lowercase: boolean
  uppercase: boolean
  number: boolean
  symbol: boolean
}

export interface PasswordStrength {
  score: number // 0-4 (0: very weak, 4: very strong)
  feedback: string[]
  requirements: PasswordRequirements
}

// Form Data Types
export interface LoginFormData {
  email: string
  password: string
}

export interface SignupFormData {
  fullName: string
  email: string
  password: string
  confirmPassword: string
}

export interface ForgotPasswordFormData {
  email: string
}

export interface ResetPasswordFormData {
  password: string
  confirmPassword: string
}

// Component Props Types
export interface AuthLayoutProps {
  children: React.ReactNode
  title: string
  description: string
  gradientFrom?: string
  gradientTo?: string
  darkGradientFrom?: string
  darkGradientTo?: string
  cardContentClass?: string
}

export interface ProtectedRouteProps {
  children: React.ReactNode
  requireAdmin?: boolean
  requireModerator?: boolean
}

// Notification Types
export interface NotificationOptions {
  title?: string
  description?: string
  duration?: number
}

// Database Function Response Types
export interface ModeratorAssignment {
  sport: string
  venue: string
  assigned_at: string
}

// Permission Types
export type Permission = 
  | "admin.all"
  | "moderator.fixtures"
  | "moderator.teams"
  | "user.profile"
  | "user.view"

// Auth State Types
export interface AuthState {
  authenticated: boolean
  user_id: string | null
  role: UserRole
  valid: boolean
  is_admin: boolean
  is_moderator: boolean
  timestamp: string
}