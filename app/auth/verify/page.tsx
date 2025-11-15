"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/use-auth"
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
  const [isMounted, setIsMounted] = useState(false)
  const { resendVerificationEmail } = useAuth()

  // Get code from query params or hash fragment
  const [code, setCode] = useState<string | null>(codeFromQuery)

  // Handle client-side mounting
  useEffect(() => {
    setIsMounted(true)
  }, [])

  /**
   * Extract verification tokens from URL hash or query params
   * Supabase uses hash fragments for email verification
   */
  useEffect(() => {
    if (!isMounted) return

    let extractedCode = null

    // Check hash fragment for Supabase auth tokens (primary method)
    const hash = window.location.hash
    if (hash) {
      const params = new URLSearchParams(hash.substring(1))
      const accessToken = params.get("access_token")
      const type = params.get("type")
      
      // Supabase sends access_token with type for email verification
      if (accessToken && type) {
        extractedCode = accessToken
      }
    }

    // Fallback to query params if needed
    if (!extractedCode && codeFromQuery) {
      extractedCode = codeFromQuery
    }

    if (extractedCode && extractedCode !== code) {
      setCode(extractedCode)
    }
  }, [isMounted, codeFromQuery, code])

  /**
   * Handle email verification from URL
   * Supabase automatically handles email verification via URL hash fragments
   */
  useEffect(() => {
    let retryCount = 0
    const maxRetries = 10 // Retry up to 10 times
    
    const handleVerification = async () => {
      if (!isMounted) return

      const supabase = createClient()
      const hasAuthParams = window.location.hash.includes("access_token") || 
                          window.location.hash.includes("refresh_token") ||
                          window.location.search.includes("code=")

      // If no auth parameters in URL, just show the resend form
      if (!hasAuthParams) {
        setIsVerifying(false)
        return
      }

      setIsVerifying(true)

      try {
        // Check current session state
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
        
        if (sessionError) {
          console.error("Session error:", sessionError)
          setIsVerifying(false)
          notifications.showError({
            title: "Verification failed",
            description: sessionError.message || "Unable to verify your email. Please try again.",
          })
          return
        }

        // If we have a session and the user is confirmed, verification is successful
        if (sessionData?.session?.user) {
          const user = sessionData.session.user
          
          // Check if user is confirmed (email verified)
          if (user.email_confirmed_at) {
            setIsVerified(true)
            notifications.showSuccess({
              title: "Email verified successfully!",
              description: "Your account has been verified. Redirecting to dashboard...",
            })

            // Redirect to appropriate dashboard
            setTimeout(async () => {
              // Refresh router to pick up server-side session
              router.refresh()
              await new Promise(resolve => setTimeout(resolve, 300))
              router.push("/learner")
            }, 2000)
            return
          }
        }

        // If no session or user not confirmed, retry if we haven't exceeded max retries
        if (retryCount < maxRetries) {
          retryCount++
          
          // Wait progressively longer between retries
          const waitTime = Math.min(1000 * retryCount, 5000)
          setTimeout(handleVerification, waitTime)
        } else {
          // Max retries exceeded
          setIsVerifying(false)
          notifications.showError({
            title: "Verification timeout",
            description: "The verification process is taking longer than expected. Please try requesting a new verification email.",
          })
        }

      } catch (error: unknown) {
        console.error("Verification process error:", error)
        setIsVerifying(false)
        notifications.showError({
          title: "Verification failed", 
          description: error instanceof Error ? error.message : "An unexpected error occurred during verification.",
        })
      }
    }

    // Start verification process after a brief delay to ensure URL is processed
    const timeoutId = setTimeout(handleVerification, 1000)
    return () => clearTimeout(timeoutId)
  }, [isMounted, router])

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

    try {
      const result = await resendVerificationEmail(resendEmail)

      if (result.success) {
        setEmailSent(true)
        notifications.showSuccess({
          title: "Verification email sent!",
          description: "Please check your inbox and spam folder.",
        })
      } else {
        notifications.showError({
          title: "Failed to send email",
          description: typeof result.error === 'string' ? result.error : result.error?.message || "Please try again later.",
        })
      }
    } catch (error: unknown) {
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
