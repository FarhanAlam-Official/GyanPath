import { NextRequest, NextResponse } from "next/server"

interface RateLimitOptions {
  windowMs: number // Time window in milliseconds
  maxRequests: number // Maximum requests per window
  keyGenerator?: (request: NextRequest) => string // Custom key generator
}

class RateLimiter {
  private requests: Map<string, { count: number; resetTime: number }> = new Map()
  private cleanupInterval: NodeJS.Timeout

  constructor() {
    // Clean up old entries every minute
    this.cleanupInterval = setInterval(() => {
      const now = Date.now()
      for (const [key, value] of this.requests.entries()) {
        if (now > value.resetTime) {
          this.requests.delete(key)
        }
      }
    }, 60000)
  }

  check(key: string, windowMs: number, maxRequests: number): { allowed: boolean; remaining: number; resetTime: number } {
    const now = Date.now()
    const entry = this.requests.get(key)

    if (!entry || now > entry.resetTime) {
      // Create new entry
      this.requests.set(key, {
        count: 1,
        resetTime: now + windowMs,
      })
      return {
        allowed: true,
        remaining: maxRequests - 1,
        resetTime: now + windowMs,
      }
    }

    if (entry.count >= maxRequests) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: entry.resetTime,
      }
    }

    // Increment count
    entry.count++
    this.requests.set(key, entry)

    return {
      allowed: true,
      remaining: maxRequests - entry.count,
      resetTime: entry.resetTime,
    }
  }

  destroy() {
    clearInterval(this.cleanupInterval)
  }
}

// Global rate limiter instance
const rateLimiter = new RateLimiter()

export function rateLimit(options: RateLimitOptions) {
  return async (request: NextRequest): Promise<NextResponse | null> => {
    const key = options.keyGenerator
      ? options.keyGenerator(request)
      : request.ip || request.headers.get("x-forwarded-for") || "unknown"

    const result = rateLimiter.check(key, options.windowMs, options.maxRequests)

    if (!result.allowed) {
      return NextResponse.json(
        {
          error: "Too many requests",
          message: "Rate limit exceeded. Please try again later.",
        },
        {
          status: 429,
          headers: {
            "X-RateLimit-Limit": options.maxRequests.toString(),
            "X-RateLimit-Remaining": result.remaining.toString(),
            "X-RateLimit-Reset": new Date(result.resetTime).toISOString(),
            "Retry-After": Math.ceil((result.resetTime - Date.now()) / 1000).toString(),
          },
        },
      )
    }

    // Add rate limit headers to successful responses
    const response = new NextResponse()
    response.headers.set("X-RateLimit-Limit", options.maxRequests.toString())
    response.headers.set("X-RateLimit-Remaining", result.remaining.toString())
    response.headers.set("X-RateLimit-Reset", new Date(result.resetTime).toISOString())

    return null // Continue with request
  }
}

// Helper to get client IP
export function getClientIP(request: NextRequest): string {
  return (
    request.ip ||
    request.headers.get("x-forwarded-for")?.split(",")[0] ||
    request.headers.get("x-real-ip") ||
    "unknown"
  )
}

