// Error tracking utility
// Can be extended to integrate with Sentry, LogRocket, etc.

interface ErrorContext {
  userId?: string
  url?: string
  userAgent?: string
  timestamp?: string
  [key: string]: unknown
}

class ErrorTracker {
  private enabled: boolean

  constructor() {
    this.enabled = process.env.NODE_ENV === "production"
  }

  captureException(error: Error, context?: ErrorContext): void {
    const errorData = {
      message: error.message,
      stack: error.stack,
      name: error.name,
      ...context,
      timestamp: new Date().toISOString(),
    }

    // In production, send to error tracking service
    if (this.enabled) {
      // TODO: Integrate with Sentry or similar
      // Sentry.captureException(error, { extra: context })
      console.error("[Error Tracker]", errorData)
    } else {
      // In development, log to console
      console.error("[Error Tracker]", errorData)
    }
  }

  captureMessage(message: string, level: "info" | "warning" | "error" = "info", context?: ErrorContext): void {
    const logData = {
      message,
      level,
      ...context,
      timestamp: new Date().toISOString(),
    }

    if (this.enabled) {
      // TODO: Integrate with Sentry or similar
      // Sentry.captureMessage(message, { level, extra: context })
      console.log(`[Error Tracker ${level.toUpperCase()}]`, logData)
    } else {
      console.log(`[Error Tracker ${level.toUpperCase()}]`, logData)
    }
  }

  setUser(userId: string, userData?: Record<string, unknown>): void {
    if (this.enabled) {
      // TODO: Set user context in error tracking service
      // Sentry.setUser({ id: userId, ...userData })
    }
  }

  clearUser(): void {
    if (this.enabled) {
      // TODO: Clear user context
      // Sentry.setUser(null)
    }
  }
}

export const errorTracker = new ErrorTracker()

// Helper to wrap async functions with error tracking
export function withErrorTracking<T extends (...args: unknown[]) => Promise<unknown>>(
  fn: T,
  context?: ErrorContext,
): T {
  return (async (...args: Parameters<T>) => {
    try {
      return await fn(...args)
    } catch (error) {
      errorTracker.captureException(error instanceof Error ? error : new Error(String(error)), context)
      throw error
    }
  }) as T
}

