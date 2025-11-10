"use client"

import { useAuth } from "@/hooks/use-auth"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { useEffect, useState } from "react"
import type { Session } from "@supabase/supabase-js"

export default function AuthDebugPage() {
  const { user, profile, loading, isAuthenticated } = useAuth()
  const [cookies, setCookies] = useState<string>("")
  const [localStorage, setLocalStorage] = useState<Record<string, string>>({})
  const [sessionData, setSessionData] = useState<Session | null>(null)

  useEffect(() => {
    // Get cookies
    setCookies(document.cookie)

    // Get localStorage
    const storage: Record<string, string> = {}
    for (let i = 0; i < window.localStorage.length; i++) {
      const key = window.localStorage.key(i)
      if (key) {
        storage[key] = window.localStorage.getItem(key) || ""
      }
    }
    setLocalStorage(storage)

    // Get session data
    const supabase = createClient()
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSessionData(session)
      // eslint-disable-next-line no-console
      console.log("[DEBUG] Session data:", session)
    })
  }, [])

  return (
    <div className="container mx-auto p-8 space-y-6">
      <h1 className="text-3xl font-bold">Auth Debug Page</h1>

      <Card>
        <CardHeader>
          <CardTitle>Auth Context State</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div>
            <strong>Loading:</strong> {loading ? "Yes" : "No"}
          </div>
          <div>
            <strong>Is Authenticated:</strong> {isAuthenticated ? "Yes" : "No"}
          </div>
          <div>
            <strong>User ID:</strong> {user?.id || "None"}
          </div>
          <div>
            <strong>User Email:</strong> {user?.email || "None"}
          </div>
          <div>
            <strong>Profile Role:</strong> {profile?.role || "None"}
          </div>
          <div>
            <strong>Profile Full Name:</strong> {profile?.full_name || "None"}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Session Data from Supabase</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="text-xs overflow-auto max-h-64 bg-muted p-4 rounded">
            {JSON.stringify(sessionData, null, 2)}
          </pre>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Cookies</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="text-xs overflow-auto max-h-64 bg-muted p-4 rounded">
            {cookies || "No cookies"}
          </pre>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>LocalStorage</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="text-xs overflow-auto max-h-64 bg-muted p-4 rounded">
            {JSON.stringify(localStorage, null, 2)}
          </pre>
        </CardContent>
      </Card>

      <div className="flex gap-4">
        <Button asChild>
          <Link href="/learner">Go to Learner Dashboard</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/auth/login">Go to Login</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/">Go Home</Link>
        </Button>
      </div>
    </div>
  )
}
