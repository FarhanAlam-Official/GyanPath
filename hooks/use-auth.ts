import { useContext } from "react"
import { AuthContext } from "@/lib/auth/context"
import type { AuthContextType } from "@/lib/auth/types"

/**
 * Hook to access authentication context
 *
 * Provides easy access to auth state and methods throughout the app.
 * Must be used within an AuthProvider.
 *
 * @returns AuthContextType object with user state and auth methods
 * @throws Error if used outside of AuthProvider
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { user, signIn, signOut, loading } = useAuth()
 *
 *   if (loading) return <div>Loading...</div>
 *
 *   if (!user) {
 *     return <button onClick={() => signIn(email, password)}>Sign In</button>
 *   }
 *
 *   return (
 *     <div>
 *       <p>Welcome, {user.email}!</p>
 *       <button onClick={signOut}>Sign Out</button>
 *     </div>
 *   )
 * }
 * ```
 */
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)

  if (context === undefined) {
    throw new Error(
      "useAuth must be used within an AuthProvider. " +
        "Make sure your component is wrapped with <AuthProvider>."
    )
  }

  return context
}

/**
 * Hook for checking authentication status
 *
 * @returns boolean indicating if user is authenticated
 */
export function useIsAuthenticated(): boolean {
  const { isAuthenticated } = useAuth()
  return isAuthenticated
}

/**
 * Hook for getting current user
 *
 * @returns User object or null
 */
export function useUser() {
  const { user } = useAuth()
  return user
}

/**
 * Hook for getting user profile
 *
 * @returns UserProfile object or null
 */
export function useProfile() {
  const { profile } = useAuth()
  return profile
}

/**
 * Hook for role-based access control
 *
 * @returns object with role checking methods
 */
export function useUserRoles() {
  const { isAdmin, isInstructor, isGroupAdmin, profile } = useAuth()

  return {
    isAdmin,
    isInstructor,
    isGroupAdmin,
    isLearner: profile?.role === "learner",
    role: profile?.role,
    hasRole: (role: string) => profile?.role === role,
    hasAnyRole: (roles: string[]) => roles.includes(profile?.role || ""),
  }
}

/**
 * Hook for authentication loading state
 *
 * @returns boolean indicating if auth is still loading
 */
export function useAuthLoading(): boolean {
  const { loading } = useAuth()
  return loading
}

export default useAuth
