"use client"

import React, { createContext, useContext, useEffect, useState, useCallback } from "react"
import { useAuth } from "@/hooks/use-auth"
import { notifications } from "@/lib/notifications"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { motion, AnimatePresence } from "framer-motion"
import { Clock, Monitor, Smartphone, Tablet, Globe, X, Shield, LogOut } from "lucide-react"
import { cn } from "@/lib/utils"

interface SessionDevice {
  id: string
  device_type: 'desktop' | 'mobile' | 'tablet'
  browser: string
  os: string
  location: string
  ip_address: string
  last_active: string
  is_current: boolean
  created_at: string
}

interface SessionContextType {
  /**
   * Current session timeout in minutes
   */
  sessionTimeout: number
  /**
   * Time until session expires (in seconds)
   */
  timeUntilExpiry: number | null
  /**
   * Whether session timeout warning is shown
   */
  showTimeoutWarning: boolean
  /**
   * Active sessions across devices
   */
  activeSessions: SessionDevice[]
  /**
   * Whether remember me is enabled
   */
  rememberMe: boolean
  /**
   * Extend current session
   */
  extendSession: () => Promise<void>
  /**
   * Revoke a specific session
   */
  revokeSession: (sessionId: string) => Promise<void>
  /**
   * Revoke all other sessions
   */
  revokeAllOtherSessions: () => Promise<void>
  /**
   * Set remember me preference
   */
  setRememberMe: (remember: boolean) => void
}

const SessionContext = createContext<SessionContextType | null>(null)

interface SessionProviderProps {
  children: React.ReactNode
  /**
   * Session timeout in minutes (default: 30)
   */
  timeoutMinutes?: number
  /**
   * Show warning minutes before expiry (default: 5)
   */
  warningMinutes?: number
}

/**
 * SessionProvider Component
 * 
 * Provides session management features:
 * - Automatic session timeout
 * - Session extension
 * - Multi-device session tracking
 * - Remember me functionality
 */
export function SessionProvider({ 
  children, 
  timeoutMinutes = 30, 
  warningMinutes = 5 
}: SessionProviderProps) {
  const { user, signOut } = useAuth()
  const [sessionTimeout] = useState(timeoutMinutes)
  const [timeUntilExpiry, setTimeUntilExpiry] = useState<number | null>(null)
  const [showTimeoutWarning, setShowTimeoutWarning] = useState(false)
  const [activeSessions, setActiveSessions] = useState<SessionDevice[]>([])
  const [rememberMe, setRememberMe] = useState(false)
  const [lastActivity, setLastActivity] = useState(Date.now())

  /**
   * Reset activity timer
   */
  const resetActivityTimer = useCallback(() => {
    setLastActivity(Date.now())
    setShowTimeoutWarning(false)
  }, [])

  /**
   * Extend current session
   */
  const extendSession = useCallback(async () => {
    try {
      resetActivityTimer()
      notifications.showSuccess({
        title: "Session extended",
        description: `Your session has been extended for ${sessionTimeout} minutes.`,
      })
    } catch {
      notifications.showError({
        title: "Failed to extend session",
        description: "Please sign in again to continue.",
      })
    }
  }, [resetActivityTimer, sessionTimeout])

  /**
   * Load active sessions (mock data for demo)
   */
  const loadActiveSessions = useCallback(async () => {
    // In a real implementation, this would fetch from your backend
    const mockSessions: SessionDevice[] = [
      {
        id: "current",
        device_type: "desktop",
        browser: "Chrome 119",
        os: "Windows 11",
        location: "New York, US",
        ip_address: "192.168.1.1",
        last_active: new Date().toISOString(),
        is_current: true,
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString() // 2 hours ago
      },
      {
        id: "mobile-session",
        device_type: "mobile",
        browser: "Safari Mobile",
        os: "iOS 17",
        location: "New York, US",
        ip_address: "192.168.1.2",
        last_active: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
        is_current: false,
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString() // 5 hours ago
      }
    ]
    setActiveSessions(mockSessions)
  }, [])

  /**
   * Revoke a specific session
   */
  const revokeSession = useCallback(async (sessionId: string) => {
    try {
      // In a real implementation, this would call your backend API
      setActiveSessions(prev => prev.filter(session => session.id !== sessionId))
      
      notifications.showSuccess({
        title: "Session revoked",
        description: "The session has been successfully revoked.",
      })
    } catch {
      notifications.showError({
        title: "Failed to revoke session",
        description: "Please try again later.",
      })
    }
  }, [])

  /**
   * Revoke all other sessions
   */
  const revokeAllOtherSessions = useCallback(async () => {
    try {
      // In a real implementation, this would call your backend API
      setActiveSessions(prev => prev.filter(session => session.is_current))
      
      notifications.showSuccess({
        title: "All other sessions revoked",
        description: "You have been signed out from all other devices.",
      })
    } catch {
      notifications.showError({
        title: "Failed to revoke sessions",
        description: "Please try again later.",
      })
    }
  }, [])

  /**
   * Handle session timeout
   */
  const handleSessionTimeout = useCallback(async () => {
    notifications.showError({
      title: "Session expired",
      description: "You have been signed out due to inactivity.",
    })
    await signOut()
  }, [signOut])

  // Set up activity listeners
  useEffect(() => {
    if (!user) return

    const activities = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart']
    
    const handleActivity = () => {
      resetActivityTimer()
    }

    activities.forEach(activity => {
      document.addEventListener(activity, handleActivity, { passive: true })
    })

    return () => {
      activities.forEach(activity => {
        document.removeEventListener(activity, handleActivity)
      })
    }
  }, [user, resetActivityTimer])

  // Set up session timeout timer
  useEffect(() => {
    if (!user || rememberMe) return

    const interval = setInterval(() => {
      const now = Date.now()
      const timeSinceLastActivity = now - lastActivity
      const timeoutMs = sessionTimeout * 60 * 1000
      const warningMs = warningMinutes * 60 * 1000
      const remainingTime = timeoutMs - timeSinceLastActivity

      if (remainingTime <= 0) {
        handleSessionTimeout()
        return
      }

      if (remainingTime <= warningMs && !showTimeoutWarning) {
        setShowTimeoutWarning(true)
      }

      setTimeUntilExpiry(Math.ceil(remainingTime / 1000))
    }, 1000)

    return () => clearInterval(interval)
  }, [user, lastActivity, sessionTimeout, warningMinutes, showTimeoutWarning, rememberMe, handleSessionTimeout])

  // Load active sessions when user is logged in
  useEffect(() => {
    if (user) {
      loadActiveSessions()
    }
  }, [user, loadActiveSessions])

  // Load remember me preference from localStorage
  useEffect(() => {
    const remembered = localStorage.getItem('rememberMe') === 'true'
    setRememberMe(remembered)
  }, [])

  // Save remember me preference to localStorage
  const handleSetRememberMe = useCallback((remember: boolean) => {
    setRememberMe(remember)
    localStorage.setItem('rememberMe', remember.toString())
    
    if (remember) {
      setShowTimeoutWarning(false)
      setTimeUntilExpiry(null)
    }
  }, [])

  const contextValue: SessionContextType = {
    sessionTimeout,
    timeUntilExpiry,
    showTimeoutWarning,
    activeSessions,
    rememberMe,
    extendSession,
    revokeSession,
    revokeAllOtherSessions,
    setRememberMe: handleSetRememberMe
  }

  return (
    <SessionContext.Provider value={contextValue}>
      {children}
      <SessionTimeoutWarning />
    </SessionContext.Provider>
  )
}

/**
 * Hook to use session context
 */
export function useSession() {
  const context = useContext(SessionContext)
  if (!context) {
    throw new Error("useSession must be used within a SessionProvider")
  }
  return context
}

/**
 * Session Timeout Warning Component
 */
function SessionTimeoutWarning() {
  const { showTimeoutWarning, timeUntilExpiry, extendSession } = useSession()

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${minutes}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <AnimatePresence>
      {showTimeoutWarning && timeUntilExpiry && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className="fixed bottom-4 right-4 z-50 max-w-sm"
        >
          <Card className="border-orange-200 bg-orange-50 dark:border-orange-900 dark:bg-orange-950">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-orange-900 dark:text-orange-100">
                <Clock className="h-4 w-4" />
                Session Expiring Soon
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-orange-800 dark:text-orange-200">
                Your session will expire in{" "}
                <span className="font-mono font-semibold">
                  {formatTime(timeUntilExpiry)}
                </span>
              </p>
              <Button
                onClick={extendSession}
                className="w-full bg-orange-600 hover:bg-orange-700 text-white"
                size="sm"
              >
                Extend Session
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

/**
 * Active Sessions Management Component
 */
export function ActiveSessionsManager() {
  const { activeSessions, revokeSession, revokeAllOtherSessions } = useSession()

  const getDeviceIcon = (deviceType: SessionDevice['device_type']) => {
    switch (deviceType) {
      case 'mobile': return Smartphone
      case 'tablet': return Tablet
      case 'desktop': return Monitor
      default: return Globe
    }
  }

  const formatLastActive = (timestamp: string) => {
    const now = new Date()
    const lastActive = new Date(timestamp)
    const diffInMinutes = Math.floor((now.getTime() - lastActive.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 1) return 'Just now'
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    
    const diffInHours = Math.floor(diffInMinutes / 60)
    if (diffInHours < 24) return `${diffInHours}h ago`
    
    const diffInDays = Math.floor(diffInHours / 24)
    return `${diffInDays}d ago`
  }

  const otherSessions = activeSessions.filter(session => !session.is_current)

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Active Sessions
            </CardTitle>
            <CardDescription>
              Manage your active sessions across all devices
            </CardDescription>
          </div>
          {otherSessions.length > 0 && (
            <Button
              variant="destructive"
              size="sm"
              onClick={revokeAllOtherSessions}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign out all others
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {activeSessions.map((session) => {
          const DeviceIcon = getDeviceIcon(session.device_type)
          
          return (
            <motion.div
              key={session.id}
              layout
              className={cn(
                "flex items-center justify-between p-4 rounded-lg border",
                session.is_current ? "bg-primary/5 border-primary/20" : "bg-muted/30"
              )}
            >
              <div className="flex items-center gap-3">
                <div className={cn(
                  "p-2 rounded-lg",
                  session.is_current ? "bg-primary/10" : "bg-muted"
                )}>
                  <DeviceIcon className="h-4 w-4" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium">
                      {session.browser} on {session.os}
                    </p>
                    {session.is_current && (
                      <Badge variant="default" className="text-xs">
                        This device
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {session.location} • {session.ip_address}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Last active: {formatLastActive(session.last_active)}
                  </p>
                </div>
              </div>
              
              {!session.is_current && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => revokeSession(session.id)}
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </motion.div>
          )
        })}
        
        {activeSessions.length === 0 && (
          <div className="text-center py-6 text-muted-foreground">
            <Monitor className="h-8 w-8 mx-auto mb-2" />
            <p>No active sessions found</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}