"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { showToast } from "@/components/ui/toast"
import { notifications } from "@/lib/notifications"
import { 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Info, 
  Loader2,
  Sparkles,
  Zap,
  Copy,
  Trash2
} from "lucide-react"

export default function ToastDemoPage() {
  const [customTitle, setCustomTitle] = useState("Custom Title")
  const [customDescription, setCustomDescription] = useState("This is a custom description")
  const [customDuration, setCustomDuration] = useState("3000")

  // Basic toast examples
  const showBasicSuccess = () => {
    showToast.success({
      title: "Success!",
      description: "Operation completed successfully.",
    })
  }

  const showBasicError = () => {
    showToast.error({
      title: "Error",
      description: "Something went wrong. Please try again.",
    })
  }

  const showBasicWarning = () => {
    showToast.warning({
      title: "Warning",
      description: "Please review your input before proceeding.",
    })
  }

  const showBasicInfo = () => {
    showToast.info({
      title: "Info",
      description: "Here's some useful information for you.",
    })
  }

  // Toast with custom duration
  const showLongDuration = () => {
    showToast.success({
      title: "Long Duration Toast",
      description: "This toast will stay for 8 seconds",
      duration: 8000,
    })
  }

  const showShortDuration = () => {
    showToast.info({
      title: "Short Duration Toast",
      description: "This toast will disappear quickly (1 second)",
      duration: 1000,
    })
  }

  // Custom toast
  const showCustomToast = () => {
    const duration = parseInt(customDuration) || 3000
    showToast.success({
      title: customTitle || "Custom Toast",
      description: customDescription || "Custom message",
      duration: duration,
    })
  }

  // Notification Manager examples
  const showNotificationManagerSuccess = () => {
    notifications.showSuccess({
      title: "Success via Manager",
      description: "Using the notification manager",
    })
  }

  const showNotificationManagerString = () => {
    notifications.showSuccess("Simple string notification")
  }

  const showNotificationManagerError = () => {
    notifications.showError({
      title: "Error via Manager",
      description: "Using the notification manager for errors",
    })
  }

  const showNotificationManagerWarning = () => {
    notifications.showWarning("This is a warning message")
  }

  const showNotificationManagerInfo = () => {
    notifications.showInfo({
      title: "Info via Manager",
      description: "Using the notification manager",
    })
  }

  // Promise-based toast
  const showPromiseToast = () => {
    const promise = new Promise<string>((resolve, reject) => {
      setTimeout(() => {
        if (Math.random() > 0.5) {
          resolve("Data loaded successfully!")
        } else {
          reject(new Error("Failed to load data"))
        }
      }, 2000)
    })

    showToast.promise(promise, {
      loading: "Loading data...",
      success: (data) => `Success: ${data}`,
      error: (err) => `Error: ${err.message}`,
    })
  }

  const showNotificationManagerPromise = () => {
    const promise = fetch("/api/demo")
      .then(() => "Data fetched successfully")
      .catch(() => {
        throw new Error("Failed to fetch data")
      })

    notifications.promise(promise, {
      loading: "Fetching data...",
      success: (data) => data,
      error: (err) => err.message,
    })
  }

  // Sequential toasts
  const showSequentialToasts = () => {
    showToast.info({ title: "Step 1", description: "Starting process..." })
    setTimeout(() => {
      showToast.success({ title: "Step 2", description: "Processing data..." })
    }, 1000)
    setTimeout(() => {
      showToast.success({ title: "Step 3", description: "Process completed!" })
    }, 2000)
  }

  // Dismiss all toasts
  const dismissAll = () => {
    showToast.dismiss()
    showToast.success({
      title: "Dismissed",
      description: "All toasts have been dismissed",
    })
  }

  // Different title/description combinations
  const showTitleOnly = () => {
    showToast.success({
      title: "Title only toast",
    })
  }

  const showDescriptionOnly = () => {
    showToast.info({
      description: "Description only toast (default title will be used)",
    })
  }

  // Error scenarios
  const showErrorScenarios = () => {
    showToast.error({
      title: "Validation Error",
      description: "Please fill in all required fields",
    })
    setTimeout(() => {
      showToast.error({
        title: "Network Error",
        description: "Unable to connect to the server. Please check your connection.",
      })
    }, 1500)
    setTimeout(() => {
      showToast.error({
        title: "Permission Denied",
        description: "You don't have permission to perform this action",
      })
    }, 3000)
  }

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <div className="container mx-auto py-10 px-4 max-w-7xl flex-1">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2 flex items-center gap-2">
          <Sparkles className="w-8 h-8 text-primary" />
          Toast Notification Demo
        </h1>
        <p className="text-muted-foreground">
          Explore all the features and variants of the toast notification system
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Basic Toast Types */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5" />
              Basic Toast Types
            </CardTitle>
            <CardDescription>
              Four main toast types with different styles and colors
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button onClick={showBasicSuccess} className="w-full justify-start" variant="outline">
              <CheckCircle2 className="w-4 h-4 mr-2 text-green-500" />
              Success Toast
            </Button>
            <Button onClick={showBasicError} className="w-full justify-start" variant="outline">
              <XCircle className="w-4 h-4 mr-2 text-red-500" />
              Error Toast
            </Button>
            <Button onClick={showBasicWarning} className="w-full justify-start" variant="outline">
              <AlertTriangle className="w-4 h-4 mr-2 text-yellow-500" />
              Warning Toast
            </Button>
            <Button onClick={showBasicInfo} className="w-full justify-start" variant="outline">
              <Info className="w-4 h-4 mr-2 text-blue-500" />
              Info Toast
            </Button>
          </CardContent>
        </Card>

        {/* Duration Examples */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Loader2 className="w-5 h-5" />
              Duration Options
            </CardTitle>
            <CardDescription>
              Control how long toasts stay visible
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button onClick={showShortDuration} className="w-full justify-start" variant="outline">
              Short Duration (1s)
            </Button>
            <Button onClick={showLongDuration} className="w-full justify-start" variant="outline">
              Long Duration (8s)
            </Button>
            <div className="pt-2">
              <Label htmlFor="duration">Custom Duration (ms)</Label>
              <Input
                id="duration"
                type="number"
                value={customDuration}
                onChange={(e) => setCustomDuration(e.target.value)}
                placeholder="3000"
                className="mt-1"
              />
            </div>
          </CardContent>
        </Card>

        {/* Custom Toast */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Copy className="w-5 h-5" />
              Custom Toast
            </CardTitle>
            <CardDescription>
              Create toasts with custom title and description
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
                placeholder="Custom Title"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={customDescription}
                onChange={(e) => setCustomDescription(e.target.value)}
                placeholder="Custom description"
                className="mt-1"
              />
            </div>
            <Button onClick={showCustomToast} className="w-full">
              Show Custom Toast
            </Button>
          </CardContent>
        </Card>

        {/* Notification Manager */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              Notification Manager
            </CardTitle>
            <CardDescription>
              Using the notification manager API
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button onClick={showNotificationManagerSuccess} className="w-full justify-start" variant="outline">
              Manager: Success (Object)
            </Button>
            <Button onClick={showNotificationManagerString} className="w-full justify-start" variant="outline">
              Manager: Success (String)
            </Button>
            <Button onClick={showNotificationManagerError} className="w-full justify-start" variant="outline">
              Manager: Error
            </Button>
            <Button onClick={showNotificationManagerWarning} className="w-full justify-start" variant="outline">
              Manager: Warning (String)
            </Button>
            <Button onClick={showNotificationManagerInfo} className="w-full justify-start" variant="outline">
              Manager: Info
            </Button>
          </CardContent>
        </Card>

        {/* Promise-based Toasts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin" />
              Promise-based Toasts
            </CardTitle>
            <CardDescription>
              Show loading, success, or error states for async operations
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button onClick={showPromiseToast} className="w-full justify-start" variant="outline">
              Promise Toast (Random Result)
            </Button>
            <Button onClick={showNotificationManagerPromise} className="w-full justify-start" variant="outline">
              Manager Promise (API Call)
            </Button>
            <Badge variant="secondary" className="w-full justify-center py-2">
              Promise toasts automatically update based on result
            </Badge>
          </CardContent>
        </Card>

        {/* Advanced Examples */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5" />
              Advanced Examples
            </CardTitle>
            <CardDescription>
              Complex toast scenarios and patterns
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button onClick={showSequentialToasts} className="w-full justify-start" variant="outline">
              Sequential Toasts
            </Button>
            <Button onClick={showErrorScenarios} className="w-full justify-start" variant="outline">
              Multiple Error Scenarios
            </Button>
            <Button onClick={showTitleOnly} className="w-full justify-start" variant="outline">
              Title Only
            </Button>
            <Button onClick={showDescriptionOnly} className="w-full justify-start" variant="outline">
              Description Only
            </Button>
          </CardContent>
        </Card>

        {/* Utility Functions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trash2 className="w-5 h-5" />
              Utility Functions
            </CardTitle>
            <CardDescription>
              Additional toast management functions
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button onClick={dismissAll} className="w-full justify-start" variant="destructive">
              Dismiss All Toasts
            </Button>
            <Badge variant="secondary" className="w-full justify-center py-2">
              Clears all currently visible toasts
            </Badge>
          </CardContent>
        </Card>

        {/* Usage Examples */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Code Examples</CardTitle>
            <CardDescription>
              How to use the toast system in your code
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Basic Usage</h4>
                <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
{`import { showToast } from '@/components/ui/toast'

// Success
showToast.success({
  title: 'Success!',
  description: 'Operation completed',
  duration: 3000
})

// Error
showToast.error({
  title: 'Error',
  description: 'Something went wrong'
})

// Warning
showToast.warning({
  title: 'Warning',
  description: 'Please review'
})

// Info
showToast.info({
  title: 'Info',
  description: 'Here's information'
})`}
                </pre>
              </div>

              <Separator />

              <div>
                <h4 className="font-semibold mb-2">Notification Manager</h4>
                <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
{`import { notifications } from '@/lib/notifications'

// Using object
notifications.showSuccess({
  title: 'Success',
  description: 'Done!'
})

// Using string (simpler)
notifications.showSuccess('Operation completed')
notifications.showError({ description: 'Error message' })
notifications.showWarning('Warning message')
notifications.showInfo('Info message')`}
                </pre>
              </div>

              <Separator />

              <div>
                <h4 className="font-semibold mb-2">Promise-based Toasts</h4>
                <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
{`// Automatic loading, success, error states
const promise = fetch('/api/data')
  .then(res => res.json())

showToast.promise(promise, {
  loading: 'Loading data...',
  success: (data) => \`Loaded: \${data.name}\`,
  error: (err) => \`Error: \${err.message}\`
})

// Or with notification manager
notifications.promise(promise, {
  loading: 'Loading...',
  success: 'Data loaded!',
  error: 'Failed to load'
})`}
                </pre>
              </div>

              <Separator />

              <div>
                <h4 className="font-semibold mb-2">Dismiss All</h4>
                <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
{`// Dismiss all visible toasts
showToast.dismiss()
// or
notifications.dismiss()`}
                </pre>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Features List */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Features</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold mb-2">Toast Types</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                <li>Success - Green gradient with checkmark</li>
                <li>Error - Red gradient with X icon</li>
                <li>Warning - Yellow/amber gradient with warning icon</li>
                <li>Info - Blue/indigo gradient with info icon</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Features</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                <li>Animated progress bar</li>
                <li>Custom duration (default: 2500ms)</li>
                <li>Dark mode support</li>
                <li>Promise-based async operations</li>
                <li>Dismiss all functionality</li>
                <li>Gradient backgrounds and shadows</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
      </div>
      <SiteFooter />
    </div>
  )
}

