"use client"

import { useAuth } from "./auth-provider"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export function ProtectedRoute({ 
  children, 
  requireAdmin = false,
  requireModerator = false 
}: { 
  children: React.ReactNode
  requireAdmin?: boolean
  requireModerator?: boolean
}) {
  const { user, isAdmin, isModerator, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/login?redirect=" + encodeURIComponent(window.location.pathname))
    }
    
    if (!loading && user && requireAdmin && !isAdmin) {
      router.push("/")
    }
    
    if (!loading && user && requireModerator && !isModerator) {
      router.push("/")
    }
  }, [user, isAdmin, isModerator, loading, router, requireAdmin, requireModerator])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-gray-100"></div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  if (requireAdmin && !isAdmin) {
    return null
  }

  if (requireModerator && !isModerator) {
    return null
  }

  return <>{children}</>
}