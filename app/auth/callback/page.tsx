"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { AuthLayout } from "@/components/auth/auth-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2, CheckCircle2, XCircle } from "lucide-react"
import { motion } from "framer-motion"
import { notifications } from "@/lib/notifications"

type CallbackState = 'loading' | 'success' | 'error'

/**
 * OAuth Callback Page
 * 
 * Handles the OAuth callback from providers like Google, GitHub, etc.
 * Exchanges the authorization code for a session and redirects to the appropriate page.
 */
export default function CallbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [state, setState] = useState<CallbackState>('loading')
  const [error, setError] = useState<string>("")

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const supabase = createClient()
        
        // Get the code and session from the URL
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          throw error
        }

        if (session?.user) {
          // Success! User is authenticated
          setState('success')
          
          notifications.showSuccess({
            title: "Welcome to GyanPath!",
            description: "You have successfully signed in.",
          })

          // Redirect to dashboard or intended page
          const redirectTo = searchParams.get('redirectTo') || '/learner'
          
          setTimeout(async () => {
            // Refresh router to pick up server-side session
            router.refresh()
            await new Promise(resolve => setTimeout(resolve, 300))
            router.push(redirectTo)
          }, 1500)
        } else {
          // Try to handle the OAuth callback
          const { data, error: callbackError } = await supabase.auth.getUser()
          
          if (callbackError) {
            throw callbackError
          }

          if (data?.user) {
            setState('success')
            notifications.showSuccess({
              title: "Welcome to GyanPath!",
              description: "You have successfully signed in.",
            })

            const redirectTo = searchParams.get('redirectTo') || '/learner'
            setTimeout(async () => {
              router.refresh()
              await new Promise(resolve => setTimeout(resolve, 300))
              router.push(redirectTo)
            }, 1500)
          } else {
            throw new Error("Authentication failed. Please try again.")
          }
        }
      } catch (error: unknown) {
        console.error("OAuth callback error:", error)
        setState('error')
        const errorMessage = error instanceof Error ? error.message : "Authentication failed"
        setError(errorMessage)
        
        notifications.showError({
          title: "Authentication failed",
          description: errorMessage || "Please try signing in again.",
        })

        // Redirect to login after error
        setTimeout(() => {
          router.push('/auth/login')
        }, 3000)
      }
    }

    handleCallback()
  }, [router, searchParams])

  return (
    <AuthLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        <Card className="border-none shadow-2xl backdrop-blur-sm bg-card/95 dark:bg-card/90">
          <CardContent className="flex flex-col items-center justify-center py-16 space-y-6">
            {state === 'loading' && (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                >
                  <Loader2 className="h-12 w-12 text-primary" />
                </motion.div>
                <div className="text-center space-y-2">
                  <h2 className="text-xl font-semibold">Completing sign in...</h2>
                  <p className="text-sm text-muted-foreground">
                    Please wait while we set up your account
                  </p>
                </div>
              </>
            )}

            {state === 'success' && (
              <>
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.5 }}
                  className="w-16 h-16 bg-green-500/10 rounded-2xl flex items-center justify-center"
                >
                  <CheckCircle2 className="w-8 h-8 text-green-600 dark:text-green-400" />
                </motion.div>
                <div className="text-center space-y-2">
                  <h2 className="text-xl font-semibold text-green-900 dark:text-green-100">
                    Welcome to GyanPath!
                  </h2>
                  <p className="text-sm text-green-700 dark:text-green-300">
                    You have successfully signed in. Redirecting...
                  </p>
                </div>
              </>
            )}

            {state === 'error' && (
              <>
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.5 }}
                  className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center"
                >
                  <XCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
                </motion.div>
                <div className="text-center space-y-2">
                  <h2 className="text-xl font-semibold text-red-900 dark:text-red-100">
                    Authentication Failed
                  </h2>
                  <p className="text-sm text-red-700 dark:text-red-300">
                    {error || "Something went wrong. Redirecting to login..."}
                  </p>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </AuthLayout>
  )
}