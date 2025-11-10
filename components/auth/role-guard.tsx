"use client"

import type React from "react"
import { useAuth } from "@/hooks/use-auth"
import { UserRole } from "@/lib/auth/types"
import { ProtectedRoute } from "./protected-route"
import { motion } from "framer-motion"
import { Shield, AlertTriangle, Home, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

interface RoleGuardProps {
  /**
   * The component to render if user has required role
   */
  children: React.ReactNode
  /**
   * Required roles (user must have at least one)
   */
  allowedRoles: UserRole | UserRole[]
  /**
   * Custom fallback component for insufficient permissions
   */
  fallback?: React.ReactNode
  /**
   * Whether to show the default access denied message
   */
  showAccessDenied?: boolean
  /**
   * Custom redirect path for unauthorized users
   */
  unauthorizedRedirect?: string
}

/**
 * RoleGuard Component
 * 
 * Wraps components that require specific user roles.
 * Features:
 * - Role-based access control
 * - Custom fallback components
 * - Automatic authentication checking
 * - Beautiful access denied UI
 * - Support for multiple roles
 */
export function RoleGuard({
  children,
  allowedRoles,
  fallback,
  showAccessDenied = true,
  unauthorizedRedirect
}: RoleGuardProps) {
  const { user, profile, isAdmin, isInstructor } = useAuth()

  // Convert single role to array for easier processing
  const rolesArray = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles]

  // Check if user has any of the required roles
  const hasRequiredRole = () => {
    if (!profile) return false

    return rolesArray.some(role => {
      switch (role) {
        case 'admin':
          return isAdmin
        case 'instructor':
          return isInstructor || isAdmin // Admins have instructor permissions
        case 'group_admin':
          return isGroupAdmin || isAdmin // Admins have group admin permissions
        case 'learner':
          return profile.role === 'learner' || isInstructor || isAdmin // Higher roles include learner permissions
        default:
          return profile.role === role
      }
    })
  }

  // Helper function to check group admin status
  const isGroupAdmin = profile?.role === 'group_admin'

  // If user doesn't have required role
  if (user && profile && !hasRequiredRole()) {
    // Custom fallback component
    if (fallback) {
      return <>{fallback}</>
    }

    // Custom redirect
    if (unauthorizedRedirect) {
      window.location.href = unauthorizedRedirect
      return null
    }

    // Default access denied UI
    if (showAccessDenied) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="w-full max-w-md"
          >
            <Card className="border-none shadow-2xl backdrop-blur-sm bg-card/95">
              <CardHeader className="text-center space-y-4">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.1, duration: 0.3 }}
                  className="mx-auto w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center"
                >
                  <Shield className="w-8 h-8 text-red-600 dark:text-red-400" />
                </motion.div>
                <CardTitle className="text-2xl font-bold text-foreground">
                  Access Denied
                </CardTitle>
                <CardDescription className="text-base">
                  You don't have permission to access this page
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-red-900 dark:text-red-100">
                        Insufficient Permissions
                      </p>
                      <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                        This page requires {rolesArray.length === 1 ? 'the' : 'one of the following'} role
                        {rolesArray.length > 1 ? 's' : ''}: {' '}
                        <span className="font-medium">
                          {rolesArray.map(role => role.replace('_', ' ')).join(', ')}
                        </span>
                      </p>
                      <p className="text-sm text-red-700 dark:text-red-300 mt-2">
                        Your current role: <span className="font-medium">{profile.role.replace('_', ' ')}</span>
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <Button
                    asChild
                    className="w-full h-11 bg-primary hover:bg-primary/90 transition-all duration-200"
                  >
                    <Link href="/dashboard">
                      <Home className="mr-2 h-4 w-4" />
                      Go to Dashboard
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => window.history.back()}
                    className="w-full h-11 hover:bg-accent transition-all duration-200"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Go Back
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      )
    }

    // No fallback, just return nothing
    return null
  }

  // User has required role, render children
  return <>{children}</>
}

/**
 * Combined ProtectedRoute + RoleGuard component
 * 
 * Handles both authentication and authorization in one component.
 */
interface AuthorizedRouteProps extends Omit<RoleGuardProps, 'children'> {
  children: React.ReactNode
  /**
   * Where to redirect if user is not authenticated
   */
  loginRedirect?: string
  /**
   * Whether to require email verification
   */
  requireEmailVerification?: boolean
}

export function AuthorizedRoute({
  children,
  allowedRoles,
  fallback,
  showAccessDenied = true,
  unauthorizedRedirect,
  loginRedirect = "/auth/login",
  requireEmailVerification = false
}: AuthorizedRouteProps) {
  return (
    <ProtectedRoute
      redirectTo={loginRedirect}
      requireEmailVerification={requireEmailVerification}
    >
      <RoleGuard
        allowedRoles={allowedRoles}
        fallback={fallback}
        showAccessDenied={showAccessDenied}
        unauthorizedRedirect={unauthorizedRedirect}
      >
        {children}
      </RoleGuard>
    </ProtectedRoute>
  )
}

/**
 * Higher-order component for role-based access control
 * 
 * @example
 * const AdminOnlyComponent = withRoleGuard(AdminPanel, ['admin'])
 * const InstructorComponent = withRoleGuard(CourseEditor, ['instructor', 'admin'])
 */
export function withRoleGuard<T extends object>(
  Component: React.ComponentType<T>,
  allowedRoles: UserRole | UserRole[],
  options: Omit<RoleGuardProps, 'children' | 'allowedRoles'> = {}
) {
  const GuardedComponent = (props: T) => {
    return (
      <RoleGuard allowedRoles={allowedRoles} {...options}>
        <Component {...props} />
      </RoleGuard>
    )
  }

  GuardedComponent.displayName = `withRoleGuard(${Component.displayName || Component.name})`
  return GuardedComponent
}

/**
 * Utility hook for checking roles in components
 */
export function useRoleCheck() {
  const { profile, isAdmin, isInstructor } = useAuth()

  const hasRole = (role: UserRole | UserRole[]): boolean => {
    if (!profile) return false

    const rolesArray = Array.isArray(role) ? role : [role]
    
    return rolesArray.some(r => {
      switch (r) {
        case 'admin':
          return isAdmin
        case 'instructor':
          return isInstructor || isAdmin
        case 'group_admin':
          return profile.role === 'group_admin' || isAdmin
        case 'learner':
          return profile.role === 'learner' || isInstructor || isAdmin
        default:
          return profile.role === r
      }
    })
  }

  const hasAnyRole = (roles: UserRole[]): boolean => {
    return hasRole(roles)
  }

  const hasAllRoles = (roles: UserRole[]): boolean => {
    return roles.every(role => hasRole(role))
  }

  return {
    hasRole,
    hasAnyRole,
    hasAllRoles,
    isAdmin,
    isInstructor,
    isGroupAdmin: profile?.role === 'group_admin',
    isLearner: profile?.role === 'learner',
    currentRole: profile?.role
  }
}