"use client"

import React, { Component, ErrorInfo, ReactNode } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, RefreshCw } from "lucide-react"

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error to error tracking service
    console.error("ErrorBoundary caught an error:", error, errorInfo)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <Card className="m-4">
          <CardHeader>
            <div className="flex items-center gap-3">
              <AlertCircle className="w-6 h-6 text-destructive" />
              <CardTitle>Something went wrong</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              An error occurred while rendering this component. Please try again.
            </p>
            {process.env.NODE_ENV === "development" && this.state.error && (
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm font-mono text-destructive break-all">
                  {this.state.error.message}
                </p>
              </div>
            )}
            <Button onClick={this.handleReset} variant="default">
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          </CardContent>
        </Card>
      )
    }

    return this.props.children
  }
}

