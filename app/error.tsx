"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, Home, RefreshCw } from "lucide-react"
import Link from "next/link"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log error to error tracking service (e.g., Sentry)
    console.error("Application error:", error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="max-w-md w-full">
        <CardHeader>
          <div className="flex items-center gap-3">
            <AlertCircle className="w-8 h-8 text-destructive" />
            <CardTitle className="text-2xl">Something went wrong!</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            We encountered an unexpected error. Please try again or return to the home page.
          </p>
          {process.env.NODE_ENV === "development" && (
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm font-mono text-destructive break-all">{error.message}</p>
              {error.digest && (
                <p className="text-xs text-muted-foreground mt-2">Error ID: {error.digest}</p>
              )}
            </div>
          )}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button onClick={reset} className="flex-1" variant="default">
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
            <Button asChild variant="outline" className="flex-1">
              <Link href="/">
                <Home className="w-4 h-4 mr-2" />
                Go Home
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

