"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { createClient } from "@/lib/supabase/client"
import { AuthLayout } from "@/components/auth/auth-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { PasswordInput } from "@/components/auth/password-input"
import { PasswordStrength } from "@/components/auth/password-strength"
import Link from "next/link"
import { Loader2, Lock, CheckCircle2, ArrowLeft, AlertCircle } from "lucide-react"
import { notifications } from "@/lib/notifications"
import { cn } from "@/lib/utils"
import { generateStrongPassword } from "@/lib/utils/password-generator"

/**
 * Reset Password Form Schema
 * Validates password strength and confirms passwords match
 */
const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(1, "Password is required")
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one number")
      .regex(
        /[!@#$%^&*(),.?":{}|<>]/,
        "Password must contain at least one special character"
      ),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>

/**
 * Reset Password Page Component
 * 
 * Allows users to reset their password using a token from the email link.
 * Features:
 * - Token validation from URL hash
 * - Password strength indicator
 * - Password visibility toggles
 * - Form validation
 * - Success state with auto-redirect
 * - Error handling for expired/invalid tokens
 * - Smooth animations
 * - Loading states
 */
export default function ResetPasswordPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isValidatingToken, setIsValidatingToken] = useState(true)
  const [tokenValid, setTokenValid] = useState(false)
  const [passwordReset, setPasswordReset] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    mode: "onBlur",
  })

  // Watch password for strength indicator
  const password = watch("password") || ""

  // Generate strong password handler
  const handleGeneratePassword = () => {
    const newPassword = generateStrongPassword(16)
    setValue("password", newPassword)
    setValue("confirmPassword", newPassword)
    notifications.showSuccess({
      title: "Strong password generated!",
      description: "Password has been filled in both fields.",
    })
  }

  /**
   * Validate reset token on component mount
   * 
   * IMPORTANT: We extract tokens from URL BEFORE creating Supabase client
   * to prevent PKCE code verifier issues when Gmail opens the link.
   * The code verifier might not exist in localStorage, causing the error:
   * "invalid request: both auth code and code verifier should be non-empty"
   */
  useEffect(() => {
    const validateToken = async () => {
      try {
        console.log('Starting password reset validation...')
        console.log('Current URL:', window.location.href)
        
        if (typeof window === 'undefined') {
          setIsValidatingToken(false)
          return
        }

        // STEP 1: Extract tokens from URL BEFORE creating Supabase client
        // This prevents Supabase from trying to auto-process PKCE codes without verifier
        const hash = window.location.hash
        const searchParams = new URLSearchParams(window.location.search)
        
        // Check for error in query params first
        const errorParam = searchParams.get('error')
        if (errorParam) {
          console.error('Error from URL:', errorParam)
          setTokenValid(false)
          notifications.showError({
            title: "Invalid or expired link",
            description: decodeURIComponent(errorParam),
          })
          setIsValidatingToken(false)
          return
        }
        
        // Extract tokens from hash (primary location for Supabase reset links)
        let accessToken: string | null = null
        let refreshToken: string | null = null
        let type: string | null = null
        let code: string | null = null
        
        if (hash) {
          const hashParams = new URLSearchParams(hash.substring(1))
          accessToken = hashParams.get('access_token')
          refreshToken = hashParams.get('refresh_token')
          type = hashParams.get('type')
          code = hashParams.get('code')
          
          console.log('Hash params:', { 
            accessToken: !!accessToken, 
            refreshToken: !!refreshToken, 
            type,
            code: !!code
          })
        }
        
        // Also check query parameters (some email clients convert hash to query)
        if (!accessToken && !code) {
          accessToken = searchParams.get('access_token')
          refreshToken = searchParams.get('refresh_token')
          type = searchParams.get('type')
          code = searchParams.get('code') || searchParams.get('token')
        }
        
        // STEP 2: Create Supabase client with detectSessionInUrl DISABLED
        // We'll handle token processing manually to avoid PKCE issues
        const { createBrowserClient } = await import("@supabase/ssr")
        const supabase = createBrowserClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          {
            auth: {
              detectSessionInUrl: false, // DISABLED - we handle manually
              persistSession: true,
              autoRefreshToken: true,
              flowType: 'pkce',
            },
          }
        )
        
        let tokenProcessed = false
        
        // STEP 3: Handle recovery tokens (access_token + refresh_token)
        // This is the preferred method and doesn't require PKCE verifier
        if (accessToken && type === 'recovery') {
          console.log('Found recovery tokens, setting session directly...')
          
          // Clean up URL immediately to prevent re-processing on refresh
          if (hash) {
            window.history.replaceState({}, '', window.location.pathname + window.location.search)
          }
          
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken || ''
          })
          
          if (error) {
            console.error('Error setting session:', error)
            // Check if error is about expired/invalid token
            if (error.message.includes('expired') || 
                error.message.includes('invalid') || 
                error.message.includes('token') ||
                error.message.includes('session') ||
                error.message.includes('code verifier')) {
              setTokenValid(false)
              notifications.showError({
                title: "Invalid or expired link",
                description: "This password reset link is invalid or has expired. Please request a new one.",
              })
              setIsValidatingToken(false)
              return
            }
          } else if (data.session) {
            console.log('Session set successfully!')
            // Verify the session is valid by checking user
            const { data: { user }, error: userError } = await supabase.auth.getUser()
            if (user && !userError) {
              console.log('Session is valid with user:', user.email)
              setTokenValid(true)
              tokenProcessed = true
            } else {
              console.error('Error getting user:', userError)
              setTokenValid(false)
              notifications.showError({
                title: "Invalid or expired link",
                description: "This password reset link is invalid or has expired. Please request a new one.",
              })
              setIsValidatingToken(false)
              return
            }
          }
        }
        
        // STEP 4: Handle PKCE code (fallback - requires code verifier)
        // Only try this if we don't have recovery tokens
        if (!tokenProcessed && code) {
          console.log('Found PKCE code, attempting to exchange...')
          
          // Clean up URL immediately
          if (hash) {
            window.history.replaceState({}, '', window.location.pathname + window.location.search)
          }
          
          // Try to exchange the code for a session
          // Note: This will fail if code_verifier is not in localStorage
          try {
            const { data, error } = await supabase.auth.exchangeCodeForSession(code)
            
            if (error) {
              console.error('Error exchanging code:', error)
              
              // If error is about missing code verifier, provide helpful message
              if (error.message.includes('code verifier') || 
                  error.message.includes('non-empty')) {
                setTokenValid(false)
                notifications.showError({
                  title: "Invalid reset link",
                  description: "This reset link cannot be processed. Please request a new password reset email.",
                })
                setIsValidatingToken(false)
                return
              }
              
              // Other errors
              if (error.message.includes('expired') || 
                  error.message.includes('invalid') || 
                  error.message.includes('token')) {
                setTokenValid(false)
                notifications.showError({
                  title: "Invalid or expired link",
                  description: "This password reset link is invalid or has expired. Please request a new one.",
                })
                setIsValidatingToken(false)
                return
              }
            } else if (data.session) {
              console.log('Code exchanged successfully!')
              setTokenValid(true)
              tokenProcessed = true
            }
          } catch (exchangeError) {
            console.error('Exception during code exchange:', exchangeError)
            setTokenValid(false)
            notifications.showError({
              title: "Invalid reset link",
              description: "This reset link cannot be processed. Please request a new password reset email.",
            })
            setIsValidatingToken(false)
            return
          }
        }
        
        // STEP 5: Check for existing valid session (in case tokens were already processed)
        if (!tokenProcessed) {
          console.log('Checking for existing session...')
          const { data: { session }, error } = await supabase.auth.getSession()
          
          if (session && !error) {
            console.log('Found existing session!')
            // Verify the session is valid by checking user
            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
              console.log('Session is valid with user:', user.email)
              setTokenValid(true)
              tokenProcessed = true
            }
          }
        }
        
        // STEP 6: If no tokens found and no session, show error
        if (!tokenProcessed) {
          console.log('No valid session or tokens found')
          setTokenValid(false)
          notifications.showError({
            title: "Invalid or expired link",
            description: "This password reset link is invalid or has expired. Please request a new one.",
          })
        }
        
      } catch (error) {
        console.error("Token validation error:", error)
        setTokenValid(false)
        notifications.showError({
          title: "Invalid or expired link", 
          description: error instanceof Error ? error.message : "This password reset link is invalid or has expired. Please request a new one.",
        })
      } finally {
        setIsValidatingToken(false)
      }
    }

    validateToken()
  }, [])

  /**
   * Handle form submission
   * Updates user password using Supabase
   */
  const onSubmit = async (data: ResetPasswordFormData) => {
    setIsLoading(true)
    const supabase = createClient()

    try {
      // Update password
      const { error } = await supabase.auth.updateUser({
        password: data.password,
      })

      if (error) {
        // Handle specific error cases
        if (error.message.includes("session")) {
          notifications.showError({
            title: "Session expired",
            description: "Your reset link has expired. Please request a new one.",
          })
          router.push("/auth/forgot-password")
          return
        } else {
          notifications.showError({
            title: "Failed to reset password",
            description: error.message,
          })
        }
        return
      }

      // Show success state
      setPasswordReset(true)
      notifications.showSuccess({
        title: "Password reset successfully!",
        description: "Redirecting to login page...",
      })

      // Redirect to login after delay
      setTimeout(() => {
        router.push("/auth/login")
      }, 2000)
    } catch (error: unknown) {
      notifications.showError({
        title: "An unexpected error occurred",
        description: error instanceof Error ? error.message : "Please try again later.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Loading state while validating token
  if (isValidatingToken) {
    return (
      <AuthLayout>
        <div className="w-full max-w-md">
          <Card className="border-none shadow-2xl backdrop-blur-sm bg-card/95 dark:bg-card/90">
            <CardContent className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </CardContent>
          </Card>
        </div>
      </AuthLayout>
    )
  }

  // Invalid token state
  if (!tokenValid) {
    return (
      <AuthLayout>
        <div className="w-full max-w-md">
          <Card className="border-none shadow-2xl backdrop-blur-sm bg-card/95 dark:bg-card/90">
            <CardHeader className="space-y-3 text-center">
              <div className="mx-auto w-16 h-16 bg-destructive/10 rounded-2xl flex items-center justify-center mb-2">
                <AlertCircle className="w-8 h-8 text-destructive" />
              </div>
              <CardTitle className="text-2xl font-bold text-foreground">
                Invalid Reset Link
              </CardTitle>
              <CardDescription className="text-base">
                This password reset link is invalid or has expired
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground text-center">
                Please request a new password reset link to continue.
              </p>
              <div className="flex flex-col gap-3">
                <Button asChild className="w-full h-11">
                  <Link href="/auth/forgot-password">Request New Reset Link</Link>
                </Button>
                <Button
                  asChild
                  variant="ghost"
                  className="w-full h-11 hover:bg-primary hover:text-white transition-all duration-200"
                >
                  <Link href="/auth/login">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Sign In
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </AuthLayout>
    )
  }

  // Success state
  if (passwordReset) {
    return (
      <AuthLayout>
        <div className="w-full max-w-md">
          <Card className="border-none shadow-2xl backdrop-blur-sm bg-card/95 dark:bg-card/90">
            <CardHeader className="space-y-3 text-center">
              <div className="mx-auto w-16 h-16 bg-green-500/10 rounded-2xl flex items-center justify-center mb-2">
                <CheckCircle2 className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <CardTitle className="text-2xl font-bold text-foreground">
                Password Reset Successful!
              </CardTitle>
              <CardDescription className="text-base">
                Your password has been updated successfully
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-sm text-muted-foreground mb-4">
                Redirecting to login page...
              </p>
              <Loader2 className="h-6 w-6 animate-spin text-primary mx-auto" />
            </CardContent>
          </Card>
        </div>
      </AuthLayout>
    )
  }

  // Reset password form
  return (
    <AuthLayout>
      <div className="w-full max-w-md">
        <Card className="border-2 border-primary/10 shadow-2xl backdrop-blur-sm bg-card/95 dark:bg-card/90 overflow-hidden relative">
          {/* Decorative gradient overlay */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#190482] via-[#7752FE] to-[#8E8FFA]" />
          
          <CardHeader className="space-y-3 text-center pb-6 pt-8">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-[#190482] via-[#7752FE] to-[#8E8FFA] rounded-2xl flex items-center justify-center mb-2 shadow-lg shadow-primary/25">
              <Lock className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent whitespace-nowrap">
              Reset Your Password
            </CardTitle>
            <CardDescription className="text-base">
              Enter your new password below
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-0 pb-6 px-6 sm:px-8">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* New Password Input */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-semibold text-foreground">
                  New Password
                </Label>
                <div className="relative group">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors z-10" />
                  <PasswordInput
                    id="password"
                    placeholder="Enter your new password"
                    showGenerateButton={true}
                    onGeneratePassword={handleGeneratePassword}
                    className={cn(
                      "pl-11 h-12 text-base transition-all duration-200 border-2",
                      "focus:ring-2 focus:ring-primary/20 focus:border-primary",
                      "hover:border-[#7752FE]",
                      errors.password && "border-destructive focus:ring-destructive/20"
                    )}
                    aria-invalid={errors.password ? "true" : "false"}
                    aria-describedby={errors.password ? "password-error" : undefined}
                    disabled={isLoading}
                    {...register("password")}
                  />
                </div>
                {/* Password Strength Indicator */}
                {password && (
                  <div className="mt-2">
                    <PasswordStrength password={password} />
                  </div>
                )}
                {errors.password && (
                  <p
                    id="password-error"
                    className="text-sm text-destructive flex items-center gap-1.5 mt-1.5"
                    role="alert"
                  >
                    <span className="w-1 h-1 rounded-full bg-destructive" />
                    {errors.password.message}
                  </p>
                )}
              </div>

              {/* Confirm Password Input */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-sm font-semibold text-foreground">
                  Confirm New Password
                </Label>
                <div className="relative group">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors z-10" />
                  <PasswordInput
                    id="confirmPassword"
                    placeholder="Confirm your new password"
                    showGenerateButton={false}
                    className={cn(
                      "pl-11 h-12 text-base transition-all duration-200 border-2",
                      "focus:ring-2 focus:ring-primary/20 focus:border-primary",
                      "hover:border-[#7752FE]",
                      errors.confirmPassword && "border-destructive focus:ring-destructive/20"
                    )}
                    aria-invalid={errors.confirmPassword ? "true" : "false"}
                    aria-describedby={
                      errors.confirmPassword ? "confirmPassword-error" : undefined
                    }
                    disabled={isLoading}
                    {...register("confirmPassword")}
                  />
                </div>
                {errors.confirmPassword && (
                  <p
                    id="confirmPassword-error"
                    className="text-sm text-destructive flex items-center gap-1.5 mt-1.5"
                    role="alert"
                  >
                    <span className="w-1 h-1 rounded-full bg-destructive" />
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full h-12 text-base font-semibold bg-gradient-to-r from-[#190482] via-[#7752FE] to-[#8E8FFA] hover:from-[#190482]/90 hover:via-[#7752FE]/90 hover:to-[#8E8FFA]/90 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl shadow-primary/25 mt-4"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Resetting Password...
                  </>
                ) : (
                  <>
                    <Lock className="mr-2 h-5 w-5" />
                    Reset Password
                  </>
                )}
              </Button>

              {/* Back to Login Button */}
              <div className="text-center pt-4 border-t border-border">
                <Button
                  asChild
                  variant="ghost"
                  className="w-full h-11 hover:bg-[#7752FE] hover:text-white transition-all duration-200"
                >
                  <Link href="/auth/login">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Sign out
                  </Link>
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </AuthLayout>
  )
}

