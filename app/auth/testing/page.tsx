"use client"

import React, { useState } from "react"
import { useAuth, useIsAuthenticated, useUserRoles } from "@/hooks/use-auth"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { RoleGuard, useRoleCheck } from "@/components/auth/role-guard"
import { UserProfileManagement } from "@/components/auth/user-profile-management"
import { SessionProvider, useSession, ActiveSessionsManager } from "@/components/auth/session-management"
import { SocialLoginButtons } from "@/components/auth/social-login-buttons"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { motion } from "framer-motion"
import { 
  Shield, 
  User, 
  Clock, 
  TestTube, 
  CheckCircle, 
  XCircle, 
  Monitor,
  UserCheck,
  LogOut,
  RefreshCw
} from "lucide-react"

/**
 * AuthTesting Component
 * 
 * Comprehensive testing interface for all authentication features:
 * - Authentication status and user info
 * - Role-based access testing
 * - Profile management
 * - Session management
 * - Social login testing
 * - Protected routes testing
 */
function AuthTestingContent() {
  const { user, profile, signOut } = useAuth()
  const isAuthenticated = useIsAuthenticated()
  const { isAdmin, isInstructor, isLearner } = useUserRoles()
  const { hasRole, currentRole } = useRoleCheck()
  const session = useSession()
  
  const [testResults, setTestResults] = useState<Record<string, boolean>>({})

  /**
   * Test a feature and store result
   */
  const testFeature = (featureName: string, testFunction: () => boolean) => {
    try {
      const result = testFunction()
      setTestResults(prev => ({ ...prev, [featureName]: result }))
      return result
    } catch (error) {
      console.error(`Test failed for ${featureName}:`, error)
      setTestResults(prev => ({ ...prev, [featureName]: false }))
      return false
    }
  }

  /**
   * Run all authentication tests
   */
  const runAllTests = () => {
    const tests = [
      { name: "User Authentication", test: () => !!user && isAuthenticated },
      { name: "Profile Loading", test: () => !!profile },
      { name: "Role Detection", test: () => !!currentRole },
      { name: "Auth Context Methods", test: () => typeof signOut === 'function' },
      { name: "Session Management", test: () => typeof session.extendSession === 'function' && Array.isArray(session.activeSessions) },
      { name: "Role Checking", test: () => hasRole(currentRole || 'learner') }
    ]

    tests.forEach(({ name, test }) => {
      testFeature(name, test)
    })
  }

  const TestResult = ({ name, result }: { name: string; result?: boolean }) => (
    <div className="flex items-center justify-between py-2">
      <span className="text-sm">{name}</span>
      {result === undefined ? (
        <Badge variant="secondary">Not Run</Badge>
      ) : result ? (
        <CheckCircle className="h-4 w-4 text-green-600" />
      ) : (
        <XCircle className="h-4 w-4 text-red-600" />
      )}
    </div>
  )

  return (
    <div className="container mx-auto p-6 max-w-6xl space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4"
      >
        <div className="flex items-center justify-center gap-2 mb-4">
          <TestTube className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Auth System Testing</h1>
        </div>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Comprehensive testing interface for all authentication features. 
          Test user management, role-based access, sessions, and more.
        </p>
      </motion.div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="roles">Role Testing</TabsTrigger>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="sessions">Sessions</TabsTrigger>
          <TabsTrigger value="social">Social Auth</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Authentication Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserCheck className="h-5 w-5" />
                  Authentication Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>Authenticated</span>
                  {isAuthenticated ? (
                    <Badge variant="default" className="bg-green-600">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Yes
                    </Badge>
                  ) : (
                    <Badge variant="destructive">
                      <XCircle className="h-3 w-3 mr-1" />
                      No
                    </Badge>
                  )}
                </div>
                
                {user && (
                  <>
                    <Separator />
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Email</span>
                        <span className="text-sm">{user.email}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">User ID</span>
                        <span className="text-sm font-mono">{user.id.slice(0, 8)}...</span>
                      </div>
                      {profile && (
                        <>
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Full Name</span>
                            <span className="text-sm">{profile.full_name}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Role</span>
                            <Badge variant="outline">{profile.role}</Badge>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Email Verified</span>
                            {profile.email_verified ? (
                              <Badge variant="secondary" className="text-green-700 bg-green-100">
                                Verified
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-orange-700 bg-orange-100">
                                Pending
                              </Badge>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Test Results */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TestTube className="h-5 w-5" />
                  Feature Tests
                </CardTitle>
                <CardDescription>
                  Run automated tests to verify all features work correctly
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button onClick={runAllTests} className="w-full gap-2">
                  <RefreshCw className="h-4 w-4" />
                  Run All Tests
                </Button>
                
                <div className="space-y-1">
                  <TestResult name="User Authentication" result={testResults["User Authentication"]} />
                  <TestResult name="Profile Loading" result={testResults["Profile Loading"]} />
                  <TestResult name="Role Detection" result={testResults["Role Detection"]} />
                  <TestResult name="Auth Context Methods" result={testResults["Auth Context Methods"]} />
                  <TestResult name="Session Management" result={testResults["Session Management"]} />
                  <TestResult name="Role Checking" result={testResults["Role Checking"]} />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>
                Test common authentication actions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                <Button variant="outline" onClick={() => window.location.href = '/auth/login'}>
                  <User className="h-4 w-4 mr-2" />
                  Go to Login
                </Button>
                <Button variant="outline" onClick={() => window.location.href = '/auth/signup'}>
                  <UserCheck className="h-4 w-4 mr-2" />
                  Go to Signup
                </Button>
                {isAuthenticated && (
                  <Button variant="destructive" onClick={signOut}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Role Testing Tab */}
        <TabsContent value="roles" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Current Role Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Role Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Current Role</span>
                    <Badge variant="default">{currentRole || 'None'}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Is Admin</span>
                    {isAdmin ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <XCircle className="h-4 w-4 text-gray-400" />
                    )}
                  </div>
                  <div className="flex justify-between">
                    <span>Is Instructor</span>
                    {isInstructor ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <XCircle className="h-4 w-4 text-gray-400" />
                    )}
                  </div>
                  <div className="flex justify-between">
                    <span>Is Learner</span>
                    {isLearner ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <XCircle className="h-4 w-4 text-gray-400" />
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Role-Based Components */}
            <Card>
              <CardHeader>
                <CardTitle>Role-Based Access</CardTitle>
                <CardDescription>
                  Test components with different role requirements
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <RoleGuard allowedRoles={['admin']}>
                    <div className="p-3 bg-red-50 border border-red-200 rounded">
                      <p className="text-sm text-red-800">✅ Admin Only Content</p>
                    </div>
                  </RoleGuard>

                  <RoleGuard 
                    allowedRoles={['admin']} 
                    fallback={
                      <div className="p-3 bg-gray-50 border border-gray-200 rounded">
                        <p className="text-sm text-gray-600">❌ Admin access required</p>
                      </div>
                    }
                  >
                    <div className="p-3 bg-red-50 border border-red-200 rounded">
                      <p className="text-sm text-red-800">✅ Admin with fallback</p>
                    </div>
                  </RoleGuard>

                  <RoleGuard allowedRoles={['instructor', 'admin']}>
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded">
                      <p className="text-sm text-blue-800">✅ Instructor or Admin</p>
                    </div>
                  </RoleGuard>

                  <RoleGuard allowedRoles={['learner', 'instructor', 'admin']}>
                    <div className="p-3 bg-green-50 border border-green-200 rounded">
                      <p className="text-sm text-green-800">✅ Any authenticated user</p>
                    </div>
                  </RoleGuard>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Profile Tab */}
        <TabsContent value="profile">
          <UserProfileManagement />
        </TabsContent>

        {/* Sessions Tab */}
        <TabsContent value="sessions" className="space-y-6">
          <div className="grid gap-6">
            {/* Session Controls */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Session Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Remember Me</Label>
                    <p className="text-sm text-muted-foreground">
                      Keep me signed in across browser sessions
                    </p>
                  </div>
                  <Switch
                    checked={session.rememberMe}
                    onCheckedChange={session.setRememberMe}
                  />
                </div>
                
                <Separator />
                
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold">{session.sessionTimeout}</p>
                    <p className="text-sm text-muted-foreground">Timeout (minutes)</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">
                      {session.timeUntilExpiry ? Math.ceil(session.timeUntilExpiry / 60) : '∞'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {session.rememberMe ? 'No timeout' : 'Minutes left'}
                    </p>
                  </div>
                </div>
                
                {!session.rememberMe && (
                  <Button 
                    onClick={session.extendSession} 
                    className="w-full gap-2"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Extend Session
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Active Sessions */}
            <ActiveSessionsManager />
          </div>
        </TabsContent>

        {/* Social Auth Tab */}
        <TabsContent value="social" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Social Authentication</CardTitle>
              <CardDescription>
                Test OAuth providers and social login functionality
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {!isAuthenticated ? (
                <div className="space-y-4">
                  <p className="text-center text-muted-foreground">
                    Sign out to test social login buttons
                  </p>
                  <SocialLoginButtons mode="sign_in" />
                </div>
              ) : (
                <div className="text-center space-y-4">
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <CheckCircle className="h-6 w-6 text-green-600 mx-auto mb-2" />
                    <p className="text-green-800 font-medium">Already authenticated!</p>
                    <p className="text-green-700 text-sm">
                      Sign out to test social login functionality
                    </p>
                  </div>
                  <Button variant="outline" onClick={signOut}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out to Test
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

/**
 * Main Auth Testing Page Component
 */
export default function AuthTestingPage() {
  return (
    <SessionProvider>
      <ProtectedRoute
        loadingComponent={
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center space-y-4">
              <Monitor className="h-12 w-12 text-primary mx-auto animate-pulse" />
              <p className="text-lg font-medium">Loading Auth Testing...</p>
            </div>
          </div>
        }
      >
        <AuthTestingContent />
      </ProtectedRoute>
    </SessionProvider>
  )
}