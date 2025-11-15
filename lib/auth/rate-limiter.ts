import { RateLimitConfig, RateLimitResult } from "./types"

/**
 * Rate limiting utility for authentication operations
 * Prevents abuse by limiting the number of attempts within a time window
 */

const DEFAULT_CONFIG: RateLimitConfig = {
  maxAttempts: 5,
  windowMs: 15 * 60 * 1000, // 15 minutes
  blockDuration: 60 * 60 * 1000, // 1 hour
}

interface AttemptRecord {
  count: number
  timestamp: number
}

export class AuthRateLimiter {
  private attempts: Map<string, AttemptRecord[]> = new Map()
  private blocked: Map<string, number> = new Map()
  private config: RateLimitConfig

  constructor(config?: Partial<RateLimitConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config }
  }

  /**
   * Check if a key is currently blocked
   */
  isBlocked(key: string): boolean {
    const blockedUntil = this.blocked.get(key)
    if (!blockedUntil) return false

    if (Date.now() > blockedUntil) {
      this.blocked.delete(key)
      return false
    }

    return true
  }

  /**
   * Record an attempt and check if the key should be blocked
   */
  recordAttempt(key: string): RateLimitResult {
    if (this.isBlocked(key)) {
      const blockedUntil = this.blocked.get(key)!
      const waitTime = blockedUntil - Date.now()
      return {
        blocked: true,
        waitTime,
        resetTime: blockedUntil,
      }
    }

    const now = Date.now()
    const attempts = this.attempts.get(key) || []

    // Remove attempts older than the window
    const recentAttempts = attempts.filter(
      (attempt) => now - attempt.timestamp < this.config.windowMs
    )

    // Add current attempt
    recentAttempts.push({ count: 1, timestamp: now })
    this.attempts.set(key, recentAttempts)

    // Check if we've exceeded the limit
    if (recentAttempts.length >= this.config.maxAttempts) {
      const blockUntil = now + this.config.blockDuration
      this.blocked.set(key, blockUntil)
      this.attempts.delete(key)

      return {
        blocked: true,
        waitTime: this.config.blockDuration,
        resetTime: blockUntil,
        remainingAttempts: 0,
      }
    }

    const remainingAttempts = this.config.maxAttempts - recentAttempts.length
    return {
      blocked: false,
      remainingAttempts,
    }
  }

  /**
   * Get remaining attempts for a key
   */
  getRemainingAttempts(key: string): number {
    if (this.isBlocked(key)) return 0

    const attempts = this.attempts.get(key) || []
    const now = Date.now()
    const recentAttempts = attempts.filter(
      (attempt) => now - attempt.timestamp < this.config.windowMs
    )

    return Math.max(0, this.config.maxAttempts - recentAttempts.length)
  }

  /**
   * Clear all attempts and blocks for a key (used after successful auth)
   */
  clearAttempts(key: string): void {
    this.attempts.delete(key)
    this.blocked.delete(key)
  }

  /**
   * Get when a key will be unblocked
   */
  getBlockedUntil(key: string): number | null {
    return this.blocked.get(key) || null
  }

  /**
   * Get time until key is unblocked (in milliseconds)
   */
  getWaitTime(key: string): number {
    const blockedUntil = this.blocked.get(key)
    if (!blockedUntil) return 0

    const waitTime = blockedUntil - Date.now()
    return Math.max(0, waitTime)
  }

  /**
   * Format wait time as human readable string
   */
  formatWaitTime(waitTime: number): string {
    const minutes = Math.ceil(waitTime / (60 * 1000))
    if (minutes <= 1) {
      return "1 minute"
    }
    return `${minutes} minutes`
  }

  /**
   * Clean up expired entries (call periodically)
   */
  cleanup(): void {
    const now = Date.now()

    // Clean up expired attempts
    for (const [key, attempts] of this.attempts.entries()) {
      const validAttempts = attempts.filter(
        (attempt) => now - attempt.timestamp < this.config.windowMs
      )

      if (validAttempts.length === 0) {
        this.attempts.delete(key)
      } else {
        this.attempts.set(key, validAttempts)
      }
    }

    // Clean up expired blocks
    for (const [key, blockedUntil] of this.blocked.entries()) {
      if (now > blockedUntil) {
        this.blocked.delete(key)
      }
    }
  }

  /**
   * Reset all data
   */
  reset(): void {
    this.attempts.clear()
    this.blocked.clear()
  }

  /**
   * Get current stats for debugging
   */
  getStats(): { activeAttempts: number; blockedKeys: number } {
    return {
      activeAttempts: this.attempts.size,
      blockedKeys: this.blocked.size,
    }
  }
}

// Create singleton instances for different auth operations
export const signInRateLimiter = new AuthRateLimiter({
  maxAttempts: 5,
  windowMs: 15 * 60 * 1000, // 15 minutes
  blockDuration: 60 * 60 * 1000, // 1 hour
})

export const signUpRateLimiter = new AuthRateLimiter({
  maxAttempts: 3,
  windowMs: 15 * 60 * 1000, // 15 minutes
  blockDuration: 30 * 60 * 1000, // 30 minutes
})

export const emailVerificationRateLimiter = new AuthRateLimiter({
  maxAttempts: 5,
  windowMs: 60 * 60 * 1000, // 1 hour
  blockDuration: 30 * 60 * 1000, // 30 minutes
})

export const passwordResetRateLimiter = new AuthRateLimiter({
  maxAttempts: 3,
  windowMs: 60 * 60 * 1000, // 1 hour
  blockDuration: 30 * 60 * 1000, // 30 minutes
})

// Cleanup function to run periodically
export const cleanupRateLimiters = () => {
  signInRateLimiter.cleanup()
  signUpRateLimiter.cleanup()
  emailVerificationRateLimiter.cleanup()
  passwordResetRateLimiter.cleanup()
}

// Run cleanup every 5 minutes
if (typeof window !== "undefined") {
  setInterval(cleanupRateLimiters, 5 * 60 * 1000)
}
