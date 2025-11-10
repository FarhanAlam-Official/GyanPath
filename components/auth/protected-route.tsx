"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { Loader2 } from "lucide-react"
import { motion } from "framer-motion"

interface ProtectedRouteProps {
  /**
   * The component to render if user is authenticated
   */
  children: React.ReactNode
  /**
   * Where to redirect if user is not authenticated
   */
  redirectTo?: string
  /**
   * Show a custom loading component while checking auth status
   */
  loadingComponent?: React.ReactNode
  /**
   * Whether to require email verification
   */
  requireEmailVerification?: boolean
}

/**
 * ProtectedRoute Component
 * 
 * Wraps components that require authentication.
 * Features:
 * - Automatic redirect to login if not authenticated
 * - Loading state while checking authentication status
 * - Optional email verification requirement
 * - Customizable loading component
 * - Smooth transitions and animations
 */
export function ProtectedRoute({
  children,
  redirectTo = "/auth/login",
  loadingComponent,
  requireEmailVerification = false
}: ProtectedRouteProps) {
  const router = useRouter()
  const { user, profile, loading } = useAuth()
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    // Wait for auth to initialize
    if (loading) return

    // If no user, redirect to login
    if (!user) {
      const currentPath = window.location.pathname
      const redirectUrl = redirectTo + (currentPath !== "/" ? `?redirectTo=${encodeURIComponent(currentPath)}` : "")
      router.push(redirectUrl)
      return
    }

    // Check email verification if required
    if (requireEmailVerification && user && profile && !profile.email_verified) {
      router.push(`/auth/verify?email=${encodeURIComponent(user.email || "")}`)
      return
    }

    // All checks passed
    setIsChecking(false)
  }, [user, profile, loading, router, redirectTo, requireEmailVerification])

  // Show loading while checking auth status
  if (loading || isChecking) {
    if (loadingComponent) {
      return <>{loadingComponent}</>
    }

    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="text-center space-y-4"
        >
          <div className="flex justify-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            >
              <Loader2 className="h-8 w-8 text-primary" />
            </motion.div>
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Loading...</h3>
            <p className="text-sm text-muted-foreground">
              Checking your authentication status
            </p>
          </div>
        </motion.div>
      </div>
    )
  }

  // Show nothing while redirecting
  if (!user) {
    return null
  }

  // Show nothing while checking email verification
  if (requireEmailVerification && profile && !profile.email_verified) {
    return null
  }

  // User is authenticated, render children
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
    >
      {children}
    </motion.div>
  )
}

/**
 * Higher-order component version of ProtectedRoute
 * 
 * @example
 * const ProtectedDashboard = withProtectedRoute(Dashboard)
 * 
 * // With options
 * const ProtectedAdmin = withProtectedRoute(AdminPanel, {
 *   redirectTo: "/auth/login",
 *   requireEmailVerification: true
 * })
 */
export function withProtectedRoute<T extends object>(
  Component: React.ComponentType<T>,
  options: Omit<ProtectedRouteProps, 'children'> = {}
) {
  const ProtectedComponent = (props: T) => {
    return (
      <ProtectedRoute {...options}>
        <Component {...props} />
      </ProtectedRoute>
    )
  }

  ProtectedComponent.displayName = `withProtectedRoute(${Component.displayName || Component.name})`
  return ProtectedComponent
}