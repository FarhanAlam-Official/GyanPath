"use client"

import { useState, useEffect, useRef } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { AuthLayout } from "@/components/auth/auth-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { PasswordInput } from "@/components/auth/password-input"
import Link from "next/link"
import { Loader2, Lock, ArrowLeft, CheckCircle2, XCircle } from "lucide-react"
import { notifications } from "@/lib/notifications"
import { cn } from "@/lib/utils"
import { createClient } from "@/lib/supabase/client"

/**
 * Reset Password Form Schema
 */
const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(1, "Password is required")
      .min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  })

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>

/**
 * Reset Password Page Component
 * 
 * Production-ready password reset implementation following Supabase best practices
 */
export default function ResetPasswordPage() {
  const { updatePassword } = useAuth()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isValidating, setIsValidating] = useState(true)
  const [isValidToken, setIsValidToken] = useState(false)
  const [passwordUpdated, setPasswordUpdated] = useState(false)
  const hasValidatedRef = useRef(false)
  const validationTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    mode: "onBlur",
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  })

  // Validate the reset token on mount - single, clean validation
  useEffect(() => {
    // Prevent multiple validations
    if (hasValidatedRef.current) return
    hasValidatedRef.current = true

    // Set a timeout to prevent infinite loading
    validationTimeoutRef.current = setTimeout(() => {
      if (isValidating) {
        console.error('[RESET PASSWORD] Validation timeout')
        setIsValidating(false)
        setIsValidToken(false)
        notifications.showError({
          title: "Validation timeout",
          description: "Please try requesting a new password reset link.",
        })
      }
    }, 10000) // 10 second timeout

    const validateAndSetSession = async () => {
      try {
        const supabase = createClient()
        
        // Read URL parameters directly (avoid useSearchParams Suspense issues)
        const url = new URL(window.location.href)
        const code = url.searchParams.get('code')
        
        // Method 1: Check for hash parameters (Supabase's primary method)
        const hash = window.location.hash
        let accessToken: string | null = null
        let refreshToken: string | null = null
        let type: string | null = null

        if (hash) {
          const hashParams = new URLSearchParams(hash.substring(1))
          accessToken = hashParams.get('access_token')
          refreshToken = hashParams.get('refresh_token')
          type = hashParams.get('type')
        }

        console.log('[RESET PASSWORD] URL analysis:', {
          hasHash: !!hash,
          hasAccessToken: !!accessToken,
          hasRefreshToken: !!refreshToken,
          type,
          hasCode: !!code
        })

        // If we have hash parameters with tokens, use setSession (standard approach)
        if (accessToken && refreshToken && type === 'recovery') {
          console.log('[RESET PASSWORD] Found hash tokens, setting session...')
          
          try {
            const { data, error } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            })

            if (error) {
              console.error('[RESET PASSWORD] setSession error:', error)
              clearTimeout(validationTimeoutRef.current!)
              setIsValidToken(false)
              setIsValidating(false)
              notifications.showError({
                title: "Invalid or expired link",
                description: error.message || "This password reset link is invalid or has expired. Please request a new one.",
              })
              return
            }

            if (data?.session?.user) {
              console.log('[RESET PASSWORD] Session established successfully')
              clearTimeout(validationTimeoutRef.current!)
              setIsValidToken(true)
              setIsValidating(false)
              // Clean up URL hash for security
              window.history.replaceState(null, '', window.location.pathname)
              return
            } else {
              throw new Error('Session established but no user found')
            }
          } catch (sessionError) {
            console.error('[RESET PASSWORD] Session error:', sessionError)
            clearTimeout(validationTimeoutRef.current!)
            setIsValidToken(false)
            setIsValidating(false)
            notifications.showError({
              title: "Failed to establish session",
              description: "Please request a new password reset link.",
            })
            return
          }
        }
        // If we have a code parameter, exchange it for a session
        else if (code) {
          console.log('[RESET PASSWORD] Found code parameter, exchanging for session...')
          
          try {
            const { data, error } = await supabase.auth.exchangeCodeForSession(code)

            if (error) {
              console.error('[RESET PASSWORD] exchangeCodeForSession error:', error)
              clearTimeout(validationTimeoutRef.current!)
              setIsValidToken(false)
              setIsValidating(false)
              notifications.showError({
                title: "Invalid or expired link",
                description: error.message || "This password reset link is invalid or has expired. Please request a new one.",
              })
              return
            }

            if (data?.session?.user) {
              console.log('[RESET PASSWORD] Code exchanged successfully, session established')
              clearTimeout(validationTimeoutRef.current!)
              setIsValidToken(true)
              setIsValidating(false)
              // Clean up URL parameters for security
              const cleanUrl = new URL(window.location.href)
              cleanUrl.searchParams.delete('code')
              window.history.replaceState(null, '', cleanUrl.pathname)
              return
            } else {
              throw new Error('Code exchanged but no session found')
            }
          } catch (exchangeError) {
            console.error('[RESET PASSWORD] Exchange error:', exchangeError)
            clearTimeout(validationTimeoutRef.current!)
            setIsValidToken(false)
            setIsValidating(false)
            notifications.showError({
              title: "Failed to exchange code",
              description: "Please request a new password reset link.",
            })
            return
          }
        }
        // Check if we already have a valid session (user might have already set session)
        else {
          console.log('[RESET PASSWORD] No tokens found, checking existing session...')
          try {
            const { data: { session }, error } = await supabase.auth.getSession()
            
            if (session?.user && !error) {
              console.log('[RESET PASSWORD] Valid session found')
              clearTimeout(validationTimeoutRef.current!)
              setIsValidToken(true)
              setIsValidating(false)
              return
            } else {
              throw new Error('No valid session found')
            }
          } catch (sessionCheckError) {
            console.error('[RESET PASSWORD] Session check error:', sessionCheckError)
            clearTimeout(validationTimeoutRef.current!)
            setIsValidToken(false)
            setIsValidating(false)
            notifications.showError({
              title: "Invalid or expired link",
              description: "This password reset link is invalid or has expired. Please request a new one.",
            })
            return
          }
        }
      } catch (error) {
        console.error("[RESET PASSWORD] Validation error:", error)
        clearTimeout(validationTimeoutRef.current!)
        setIsValidToken(false)
        setIsValidating(false)
        notifications.showError({
          title: "Error validating link",
          description: error instanceof Error ? error.message : "Please request a new password reset link.",
        })
      }
    }

    validateAndSetSession()

    // Cleanup timeout on unmount
    return () => {
      if (validationTimeoutRef.current) {
        clearTimeout(validationTimeoutRef.current)
      }
    }
  }, []) // Empty dependency array - only run once on mount

  /**
   * Handle form submission
   * Updates the user's password
   */
  const onSubmit = async (data: ResetPasswordFormData) => {
    setIsLoading(true)

    try {
      const result = await updatePassword(data.password)

      if (result.error) {
        // Handle specific error types
        if (result.error.type === "validation") {
          notifications.showError({
            title: "Invalid password",
            description: result.error.message,
          })
        } else if (result.error.message.includes("expired") || result.error.message.includes("Invalid token")) {
          notifications.showError({
            title: "Link expired",
            description: "This password reset link has expired. Please request a new one.",
          })
          setTimeout(() => {
            router.push("/auth/forgot-password")
          }, 3000)
        } else {
          notifications.showError({
            title: "Failed to update password",
            description: result.error.message,
          })
        }
        return
      }

      // Show success message
      setPasswordUpdated(true)
      notifications.showSuccess({
        title: "Password updated!",
        description: "Your password has been successfully updated.",
      })

      // Redirect to login after a delay
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

  // Loading state while validating
  if (isValidating) {
    return (
      <AuthLayout>
        <div className="w-full max-w-md mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="border-2 border-primary/10 shadow-2xl backdrop-blur-sm bg-card/95 dark:bg-card/90">
            <CardContent className="flex flex-col items-center justify-center py-16 space-y-4">
              <Loader2 className="h-12 w-12 text-primary animate-spin" />
              <div className="text-center space-y-2">
                <h2 className="text-xl font-semibold">Validating reset link...</h2>
                <p className="text-sm text-muted-foreground">
                  Please wait while we verify your password reset link
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </AuthLayout>
    )
  }

  // Invalid token state
  if (!isValidToken) {
    return (
      <AuthLayout>
        <div className="w-full max-w-md mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="border-2 border-primary/10 shadow-2xl backdrop-blur-sm bg-card/95 dark:bg-card/90 overflow-hidden relative">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#190482] via-[#7752FE] to-[#8E8FFA]" />
            
            <CardContent className="flex flex-col items-center justify-center py-16 space-y-6">
              <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center">
                <XCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
              </div>
              <div className="text-center space-y-2">
                <h2 className="text-xl font-semibold text-red-900 dark:text-red-100">
                  Invalid Reset Link
                </h2>
                <p className="text-sm text-red-700 dark:text-red-300">
                  This password reset link is invalid or has expired.
                </p>
              </div>
              <div className="flex flex-col gap-3 w-full pt-4">
                <Button
                  onClick={() => router.push("/auth/forgot-password")}
                  className="w-full"
                >
                  Request New Reset Link
                </Button>
                <Link
                  href="/auth/login"
                  className="flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-[#7752FE] transition-colors font-medium"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to login
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </AuthLayout>
    )
  }

  // Success state after password update
  if (passwordUpdated) {
    return (
      <AuthLayout>
        <div className="w-full max-w-md mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="border-2 border-primary/10 shadow-2xl backdrop-blur-sm bg-card/95 dark:bg-card/90 overflow-hidden relative">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#190482] via-[#7752FE] to-[#8E8FFA]" />
            
            <CardContent className="flex flex-col items-center justify-center py-16 space-y-6">
              <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <div className="text-center space-y-2">
                <h2 className="text-xl font-semibold text-green-900 dark:text-green-100">
                  Password Updated!
                </h2>
                <p className="text-sm text-green-700 dark:text-green-300">
                  Your password has been successfully updated. Redirecting to login...
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </AuthLayout>
    )
  }

  // Main reset password form
  return (
    <AuthLayout>
      <div className="w-full max-w-md mx-auto px-4 sm:px-6 lg:px-8">
        <Card className="border-2 border-primary/10 shadow-2xl backdrop-blur-sm bg-card/95 dark:bg-card/90 overflow-hidden relative">
          {/* Decorative gradient overlay */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#190482] via-[#7752FE] to-[#8E8FFA]" />

          <CardHeader className="space-y-4 text-center pb-8 pt-8">
            {/* Icon */}
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-[#190482] via-[#7752FE] to-[#8E8FFA] rounded-2xl flex items-center justify-center mb-2 shadow-lg shadow-primary/25">
              <Lock className="w-8 h-8 text-white" />
            </div>

            <div className="space-y-2">
              <CardTitle className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                Reset Password
              </CardTitle>
              <CardDescription className="text-base">
                Enter your new password below
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="pt-0 pb-8 px-6 sm:px-8">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
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
                    className={cn(
                      "pl-11 h-12 text-base transition-all duration-200 border-2",
                      "focus:ring-2 focus:ring-primary/20 focus:border-primary",
                      "hover:border-primary/50",
                      errors.password && "border-destructive focus:ring-destructive/20"
                    )}
                    aria-invalid={errors.password ? "true" : "false"}
                    aria-describedby={errors.password ? "password-error" : undefined}
                    disabled={isLoading}
                    {...register("password")}
                  />
                </div>
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
                  Confirm Password
                </Label>
                <div className="relative group">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors z-10" />
                  <PasswordInput
                    id="confirmPassword"
                    placeholder="Confirm your new password"
                    className={cn(
                      "pl-11 h-12 text-base transition-all duration-200 border-2",
                      "focus:ring-2 focus:ring-primary/20 focus:border-primary",
                      "hover:border-primary/50",
                      errors.confirmPassword && "border-destructive focus:ring-destructive/20"
                    )}
                    aria-invalid={errors.confirmPassword ? "true" : "false"}
                    aria-describedby={errors.confirmPassword ? "confirm-password-error" : undefined}
                    disabled={isLoading}
                    {...register("confirmPassword")}
                  />
                </div>
                {errors.confirmPassword && (
                  <p
                    id="confirm-password-error"
                    className="text-sm text-destructive flex items-center gap-1.5 mt-1.5"
                    role="alert"
                  >
                    <span className="w-1 h-1 rounded-full bg-destructive" />
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>

              {/* Password Requirements */}
              <div className="text-xs text-muted-foreground space-y-1 pt-2">
                <p className="font-medium">Password requirements:</p>
                <ul className="list-disc list-inside space-y-0.5 ml-2">
                  <li>At least 6 characters long</li>
                  <li>Use a mix of letters, numbers, and symbols for better security</li>
                </ul>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full h-12 text-base font-semibold bg-gradient-to-r from-[#190482] via-[#7752FE] to-[#8E8FFA] hover:from-[#190482]/90 hover:via-[#7752FE]/90 hover:to-[#8E8FFA]/90 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl shadow-primary/25 mt-6"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Updating password...
                  </>
                ) : (
                  <>
                    <Lock className="mr-2 h-5 w-5" />
                    Update Password
                  </>
                )}
              </Button>

              {/* Back to Login */}
              <div className="text-center pt-4 border-t border-border">
                <Link
                  href="/auth/login"
                  className="flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-[#7752FE] transition-colors font-medium"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to login
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </AuthLayout>
  )
}
