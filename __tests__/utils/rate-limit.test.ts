import { rateLimit, getClientIP } from "@/lib/utils/rate-limit"
import { NextRequest } from "next/server"

describe("Rate Limiter", () => {
  beforeEach(() => {
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.runOnlyPendingTimers()
    jest.useRealTimers()
  })

  it("allows requests within limit", async () => {
    const request = new NextRequest("http://localhost:3000/api/test")
    const limiter = rateLimit({
      windowMs: 60000,
      maxRequests: 10,
    })

    for (let i = 0; i < 10; i++) {
      const response = await limiter(request)
      expect(response).toBeNull() // No rate limit response = allowed
    }
  })

  it("blocks requests exceeding limit", async () => {
    const request = new NextRequest("http://localhost:3000/api/test")
    const limiter = rateLimit({
      windowMs: 60000,
      maxRequests: 5,
    })

    // Make 5 requests (within limit)
    for (let i = 0; i < 5; i++) {
      const response = await limiter(request)
      expect(response).toBeNull()
    }

    // 6th request should be blocked
    const blockedResponse = await limiter(request)
    expect(blockedResponse).not.toBeNull()
    expect(blockedResponse?.status).toBe(429)
  })

  it("resets limit after window expires", async () => {
    const request = new NextRequest("http://localhost:3000/api/test")
    const limiter = rateLimit({
      windowMs: 1000,
      maxRequests: 3,
    })

    // Make 3 requests
    for (let i = 0; i < 3; i++) {
      const response = await limiter(request)
      expect(response).toBeNull()
    }

    // 4th should be blocked
    const blocked = await limiter(request)
    expect(blocked?.status).toBe(429)

    // Advance time
    jest.advanceTimersByTime(1001)

    // Should be allowed again
    const allowed = await limiter(request)
    expect(allowed).toBeNull()
  })

  it("extracts client IP correctly", () => {
    const request1 = new NextRequest("http://localhost:3000/api/test", {
      headers: {
        "x-forwarded-for": "192.168.1.1",
      },
    })
    expect(getClientIP(request1)).toBe("192.168.1.1")

    const request2 = new NextRequest("http://localhost:3000/api/test", {
      headers: {
        "x-real-ip": "10.0.0.1",
      },
    })
    expect(getClientIP(request2)).toBe("10.0.0.1")
  })
})

