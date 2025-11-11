"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { AuthLayout } from "@/components/auth/auth-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Mail, CheckCircle2, Loader2, Send, ArrowLeft } from "lucide-react"
import { motion } from "framer-motion"
import { notifications } from "@/lib/notifications"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { cn } from "@/lib/utils"

/**
 * Verify Page Component
 *
 * Enhanced email verification page with:
 * - Automatic code verification from email link
 * - Resend verification email functionality
 * - Animated email icon
 * - Better visual hierarchy
 * - Loading states
 * - Option to manually enter email for resend
 * - Link back to login
 * - Success feedback
 */
export default function VerifyPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const codeFromQuery = searchParams.get("code")
  const email = searchParams.get("email") || ""
  const [resendEmail, setResendEmail] = useState(email)
  const [isResending, setIsResending] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)
  const [isVerified, setIsVerified] = useState(false)

  // Get code immediately from URL on mount
  const codeFromUrl =
    typeof window !== "undefined"
      ? new URLSearchParams(window.location.search).get("code") ||
        (() => {
          const hash = window.location.hash
          if (hash) {
            const params = new URLSearchParams(hash.substring(1))
            const accessToken = params.get("access_token")
            const type = params.get("type")
            if (accessToken && type === "email") {
              return accessToken
            }
            return params.get("code")
          }
          return null
        })()
      : null

  // Get code from query params or hash fragment
  const [code, setCode] = useState<string | null>(codeFromUrl || codeFromQuery)

  /**
   * Extract code from hash fragment if not in query params
   */
  useEffect(() => {
    if (codeFromUrl) {
      setCode(codeFromUrl)
      return
    }

    if (codeFromQuery) {
      setCode(codeFromQuery)
      return
    }

    // Check hash fragment for Supabase auth tokens
    if (typeof window !== "undefined") {
      const hash = window.location.hash
      if (hash) {
        const params = new URLSearchParams(hash.substring(1))
        const accessToken = params.get("access_token")
        const type = params.get("type")

        if (accessToken && type === "email") {
          setCode(accessToken)
        } else {
          // Try to extract code from hash
          const codeFromHash = params.get("code")
          if (codeFromHash) {
            setCode(codeFromHash)
          }
        }
      }
    }
  }, [codeFromQuery, codeFromUrl])

  /**
   * Handle email verification code from URL
   * Exchanges the code with Supabase to verify the email
   */
  useEffect(() => {
    const verifyCode = async () => {
      if (!code) return

      setIsVerifying(true)
      const supabase = createClient()

      try {
        // Try to exchange the code for a session
        // First, try verifyOtp with the code as token_hash
        const { data, error } = await supabase.auth.verifyOtp({
          token_hash: code,
          type: "email",
        })

        if (error) {
          // If that fails, try with the code directly as token
          const { data: data2, error: error2 } = await supabase.auth.verifyOtp({
            token: code,
            type: "email",
          })

          if (error2) {
            notifications.showError({
              title: "Verification failed",
              description: error2.message || "The verification link is invalid or has expired.",
            })
            return
          }

          if (data2?.user) {
            setIsVerified(true)
            notifications.showSuccess({
              title: "Email verified successfully!",
              description: "Your account has been verified. Redirecting to login...",
            })

            setTimeout(() => {
              router.push("/auth/login")
            }, 2000)
          }
          return
        }

        if (data?.user) {
          setIsVerified(true)
          notifications.showSuccess({
            title: "Email verified successfully!",
            description: "Your account has been verified. Redirecting to login...",
          })

          // Redirect to login after a short delay
          setTimeout(() => {
            router.push("/auth/login")
          }, 2000)
        }
      } catch (error: unknown) {
        console.error("Verification error:", error)
        notifications.showError({
          title: "Verification failed",
          description: error instanceof Error ? error.message : "An unexpected error occurred.",
        })
      } finally {
        setIsVerifying(false)
      }
    }

    verifyCode()
  }, [code, router])

  /**
   * Handle resend verification email
   * Sends a new verification email to the provided email address
   */
  const handleResendEmail = async () => {
    if (!resendEmail) {
      notifications.showError({
        title: "Email required",
        description: "Please enter your email address.",
      })
      return
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(resendEmail)) {
      notifications.showError({
        title: "Invalid email",
        description: "Please enter a valid email address.",
      })
      return
    }

    setIsResending(true)
    const supabase = createClient()

    try {
      // Resend verification email
      const { error } = await supabase.auth.resend({
        type: "signup",
        email: resendEmail,
        options: {
          emailRedirectTo:
            process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ||
            `${window.location.origin}/auth/verify`,
        },
      })

      if (error) {
        notifications.showError({
          title: "Failed to send email",
          description: error.message,
        })
        return
      }

      setEmailSent(true)
      notifications.showSuccess({
        title: "Verification email sent!",
        description: "Please check your inbox and spam folder.",
      })
    } catch (error: unknown) {
      console.error("Resend error:", error)
      notifications.showError({
        title: "An unexpected error occurred",
        description: error instanceof Error ? error.message : "Please try again later.",
      })
    } finally {
      setIsResending(false)
    }
  }

  // Show loading state while verifying code
  if (isVerifying) {
    return (
      <AuthLayout>
        <div className="w-full max-w-md">
          <Card className="border-none shadow-2xl backdrop-blur-sm bg-card/95 dark:bg-card/90">
            <CardContent className="flex flex-col items-center justify-center py-12 space-y-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Verifying your email...</p>
            </CardContent>
          </Card>
        </div>
      </AuthLayout>
    )
  }

  // Show success state after verification
  if (isVerified) {
    return (
      <AuthLayout>
        <div className="w-full max-w-md">
          <Card className="border-none shadow-2xl backdrop-blur-sm bg-card/95 dark:bg-card/90">
            <CardHeader className="space-y-4 text-center">
              <div className="mx-auto w-20 h-20 bg-green-500/10 rounded-2xl flex items-center justify-center mb-2">
                <CheckCircle2 className="w-10 h-10 text-green-600 dark:text-green-400" />
              </div>
              <CardTitle className="text-2xl font-bold text-foreground">Email Verified!</CardTitle>
              <CardDescription className="text-base">
                Your account has been successfully verified
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-sm text-muted-foreground">Redirecting to login page...</p>
              <Loader2 className="h-6 w-6 animate-spin text-primary mx-auto" />
            </CardContent>
          </Card>
        </div>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout>
      {/* Verify Card with Animation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="w-full max-w-md"
      >
        <Card className="border-none shadow-2xl backdrop-blur-sm bg-card/95 dark:bg-card/90">
          <CardHeader className="space-y-4 text-center">
            {/* Animated Email Icon */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.3 }}
              className="mx-auto w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center mb-2"
            >
              <motion.div
                animate={{
                  y: [0, -5, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <Mail className="w-10 h-10 text-primary" />
              </motion.div>
            </motion.div>

            <CardTitle className="text-2xl font-bold text-foreground">Check Your Email</CardTitle>
            <CardDescription className="text-base">
              We&apos;ve sent you a verification link
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Success State */}
            {emailSent && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg"
              >
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-green-900 dark:text-green-100">
                      Email sent successfully!
                    </p>
                    <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                      Please check your inbox and spam folder for the verification link.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Instructions */}
            <div className="space-y-3 text-center">
              <p className="text-sm text-muted-foreground leading-relaxed">
                Please check your email and click the verification link to activate your account.
                Once verified, you can sign in to GyanPath.
              </p>
              <p className="text-xs text-muted-foreground">
                Didn&apos;t receive the email? Check your spam folder or resend it below.
              </p>
            </div>

            {/* Resend Email Form */}
            <div className="space-y-4 pt-4 border-t">
              <div className="space-y-2">
                <Label htmlFor="resendEmail" className="text-sm font-medium">
                  Email Address
                </Label>
                <Input
                  id="resendEmail"
                  type="email"
                  placeholder="your@email.com"
                  value={resendEmail}
                  onChange={(e) => setResendEmail(e.target.value)}
                  className="h-11 transition-all duration-200 focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  disabled={isResending}
                />
              </div>

              <Button
                onClick={handleResendEmail}
                className="w-full h-11 text-base font-medium transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                disabled={isResending || !resendEmail}
              >
                {isResending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Resend Verification Email
                  </>
                )}
              </Button>
            </div>

            {/* Back to Login Link */}
            <div className="text-center pt-4 border-t">
              <Link
                href="/auth/login"
                className="inline-flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors underline-offset-4 hover:underline"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Sign In
              </Link>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </AuthLayout>
  )
}
