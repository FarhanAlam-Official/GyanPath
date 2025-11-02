// Simple in-memory cache for API responses
// In production, consider using Redis or similar

interface CacheEntry<T> {
  data: T
  expiresAt: number
}

class SimpleCache {
  private cache: Map<string, CacheEntry<unknown>> = new Map()
  private cleanupInterval: NodeJS.Timeout

  constructor() {
    // Clean up expired entries every 5 minutes
    this.cleanupInterval = setInterval(() => {
      const now = Date.now()
      for (const [key, entry] of this.cache.entries()) {
        if (now > entry.expiresAt) {
          this.cache.delete(key)
        }
      }
    }, 5 * 60 * 1000)
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key) as CacheEntry<T> | undefined
    if (!entry) {
      return null
    }

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key)
      return null
    }

    return entry.data
  }

  set<T>(key: string, data: T, ttlMs: number): void {
    this.cache.set(key, {
      data,
      expiresAt: Date.now() + ttlMs,
    })
  }

  delete(key: string): void {
    this.cache.delete(key)
  }

  clear(): void {
    this.cache.clear()
  }

  destroy() {
    clearInterval(this.cleanupInterval)
  }
}

export const cache = new SimpleCache()

// Cache key generators
export function getCacheKey(prefix: string, ...parts: (string | number | undefined)[]): string {
  return `${prefix}:${parts.filter(Boolean).join(":")}`
}

// Common cache TTLs
export const CACHE_TTL = {
  SHORT: 30 * 1000, // 30 seconds
  MEDIUM: 5 * 60 * 1000, // 5 minutes
  LONG: 30 * 60 * 1000, // 30 minutes
  VERY_LONG: 60 * 60 * 1000, // 1 hour
} as const

