"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { createClient } from "@/lib/supabase/client"
import { AuthLayout } from "@/components/auth/auth-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { motion } from "framer-motion"
import { Loader2, Mail, ArrowLeft, CheckCircle2, Lock } from "lucide-react"
import { notifications } from "@/lib/notifications"
import { cn } from "@/lib/utils"

/**
 * Forgot Password Form Schema
 * Validates email format
 */
const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
})

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>

/**
 * Forgot Password Page Component
 * 
 * Allows users to request a password reset email.
 * Features:
 * - Email validation
 * - Success state with instructions
 * - Integration with Supabase password reset
 * - Smooth animations
 * - Loading states
 * - Toast notifications
 * - Link back to login
 */
export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  const [sentEmail, setSentEmail] = useState("")
  const [countdown, setCountdown] = useState(0)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    mode: "onBlur",
  })

  // Countdown timer effect
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1)
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [countdown])

  /**
   * Handle form submission
   * Sends password reset email via Supabase
   */
  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsLoading(true)
    const supabase = createClient()

    try {
      // Send password reset email
      const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      })

      if (error) {
        // Handle specific error cases
        if (error.message.includes("rate limit")) {
          notifications.showError({
            title: "Too many requests",
            description: "Please wait a few minutes before trying again.",
          })
        } else {
          notifications.showError({
            title: "Failed to send email",
            description: error.message,
          })
        }
        return
      }

      // Show success state
      setEmailSent(true)
      setSentEmail(data.email)
      setCountdown(60) // Start 60 second countdown
      notifications.showSuccess({
        title: "Reset email sent!",
        description: "Please check your inbox for password reset instructions.",
      })
    } catch (error: unknown) {
      console.error("Forgot password error:", error)
      notifications.showError({
        title: "An unexpected error occurred",
        description: error instanceof Error ? error.message : "Please try again later.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * Handle resend email
   * Resends password reset email and restarts countdown
   */
  const handleResend = async () => {
    if (countdown > 0 || !sentEmail) return

    setIsLoading(true)
    const supabase = createClient()

    try {
      // Send password reset email again
      const { error } = await supabase.auth.resetPasswordForEmail(sentEmail, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      })

      if (error) {
        // Handle specific error cases
        if (error.message.includes("rate limit")) {
          notifications.showError({
            title: "Too many requests",
            description: "Please wait a few minutes before trying again.",
          })
        } else {
          notifications.showError({
            title: "Failed to send email",
            description: error.message,
          })
        }
        return
      }

      // Restart countdown
      setCountdown(60)
      notifications.showSuccess({
        title: "Email resent!",
        description: "Please check your inbox for password reset instructions.",
      })
    } catch (error: unknown) {
      console.error("Resend email error:", error)
      notifications.showError({
        title: "An unexpected error occurred",
        description: error instanceof Error ? error.message : "Please try again later.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthLayout>
      {/* Forgot Password Card with Animation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="w-full max-w-md"
      >
        <Card className="border-none shadow-2xl backdrop-blur-sm bg-card/95 dark:bg-card/90">
          <CardHeader className="space-y-3 text-center">
            {/* Icon */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.3 }}
              className="mx-auto w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-2"
            >
              <Lock className="w-8 h-8 text-primary" />
            </motion.div>

            <CardTitle className="text-2xl font-bold text-foreground">
              Forgot Password?
            </CardTitle>
            <CardDescription className="text-base">
              {emailSent
                ? "Check your email for reset instructions"
                : "Enter your email and we'll send you reset instructions"}
            </CardDescription>
          </CardHeader>

          <CardContent>
            {emailSent ? (
              /* Success State */
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                {/* Success Message */}
                <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-green-900 dark:text-green-100">
                        Email sent successfully!
                      </p>
                      <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                        We&apos;ve sent password reset instructions to{" "}
                        <span className="font-medium">{sentEmail}</span>
                      </p>
                    </div>
                  </div>
                </div>

                {/* Instructions */}
                <div className="space-y-3 text-sm text-muted-foreground">
                  <p>Please check your email and follow the instructions to reset your password.</p>
                  <p className="text-xs">
                    Didn&apos;t receive the email? Check your spam folder or try again.
                  </p>
                </div>

                {/* Actions */}
                <div className="space-y-3 pt-4">
                  <Button
                    onClick={handleResend}
                    variant="outline"
                    className="w-full h-11 hover:bg-accent hover:border-accent-foreground/20 hover:text-black hover:scale-105 transition-all duration-200 relative"
                    disabled={isLoading || countdown > 0}
                  >
                    <div className="flex items-center justify-center w-full">
                      <span className="flex items-center gap-2">
                        {isLoading ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Sending...
                          </>
                        ) : (
                          <>
                            <Mail className="h-4 w-4 " />
                            Resend Instructions
                          </>
                        )}
                      </span>
                    </div>
                    {countdown > 0 && (
                      <span className="absolute right-4 text-sm font-mono text-muted-foreground">
                        {countdown}s
                      </span>
                    )}
                  </Button>
                  <Button
                    asChild
                    variant="ghost"
                    className="w-full h-11 hover:bg-accent/50 transition-all duration-200"
                  >
                    <Link href="/auth/login">
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Back to Sign In
                    </Link>
                  </Button>
                </div>
              </motion.div>
            ) : (
              /* Form State */
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                {/* Email Input */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">
                    Email Address
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="your@email.com"
                      className={cn(
                        "pl-10 h-11 transition-all duration-200",
                        "focus:ring-2 focus:ring-primary/20 focus:border-primary",
                        errors.email && "border-destructive focus:ring-destructive/20"
                      )}
                      aria-invalid={errors.email ? "true" : "false"}
                      aria-describedby={errors.email ? "email-error" : undefined}
                      disabled={isLoading}
                      {...register("email")}
                    />
                  </div>
                  {errors.email && (
                    <motion.p
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      id="email-error"
                      className="text-sm text-destructive"
                      role="alert"
                    >
                      {errors.email.message}
                    </motion.p>
                  )}
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="w-full h-11 text-base font-medium transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] hover:shadow-lg"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Mail className="mr-2 h-4 w-4" />
                      Send Reset Instructions
                    </>
                  )}
                </Button>

                {/* Back to Login Button */}
                <Button
                  asChild
                  variant="ghost"
                  className="w-full h-11 hover:bg-accent/50 transition-all duration-200"
                >
                  <Link href="/auth/login">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Sign In
                  </Link>
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </AuthLayout>
  )
}

