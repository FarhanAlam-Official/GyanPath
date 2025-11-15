import { createServerClient } from "@/lib/supabase/server"
import { GET, POST } from "@/app/api/courses/[id]/ratings/route"
import { NextRequest } from "next/server"
import { createMockSupabaseClient } from "../utils/mock-supabase"

jest.mock("@/lib/supabase/server", () => ({
  createServerClient: jest.fn(),
}))

describe("Ratings API", () => {
  const mockSupabase = createMockSupabaseClient()

  beforeEach(() => {
    jest.clearAllMocks()
    ;(createServerClient as jest.Mock).mockReturnValue(mockSupabase)
  })

  describe("GET /api/courses/[id]/ratings", () => {
    it("returns ratings for a course", async () => {
      const mockRatings = [
        {
          id: "rating-1",
          course_id: "course-123",
          user_id: "user-123",
          rating: 5,
          review: "Excellent course!",
          is_helpful_count: 10,
          created_at: new Date().toISOString(),
          user: {
            id: "user-123",
            full_name: "Test User",
          },
        },
      ]

      mockSupabase._setMockData("course_ratings", mockRatings)

      const request = new NextRequest("http://localhost:3000/api/courses/course-123/ratings")
      const response = await GET(request, { params: Promise.resolve({ id: "course-123" }) })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.ratings).toBeDefined()
    })
  })

  describe("POST /api/courses/[id]/ratings", () => {
    it("creates a new rating", async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: {
          user: {
            id: "user-123",
          },
        },
      })

      mockSupabase._getMockFrom().mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { id: "enrollment-123" },
          error: null,
        }),
      })

      mockSupabase._getMockFrom().mockReturnValueOnce({
        upsert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: {
            id: "rating-123",
            course_id: "course-123",
            rating: 5,
            review: "Great!",
            user_id: "user-123",
          },
          error: null,
        }),
      })

      const request = new NextRequest("http://localhost:3000/api/courses/course-123/ratings", {
        method: "POST",
        body: JSON.stringify({
          rating: 5,
          review: "Great!",
        }),
      })

      const response = await POST(request, { params: Promise.resolve({ id: "course-123" }) })
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data.rating).toBeDefined()
    })

    it("validates rating is between 1 and 5", async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: {
          user: {
            id: "user-123",
          },
        },
      })

      const request = new NextRequest("http://localhost:3000/api/courses/course-123/ratings", {
        method: "POST",
        body: JSON.stringify({
          rating: 6,
          review: "Invalid rating",
        }),
      })

      const response = await POST(request, { params: Promise.resolve({ id: "course-123" }) })
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toContain("between 1 and 5")
    })

    it("validates review length", async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: {
          user: {
            id: "user-123",
          },
        },
      })

      const longReview = "a".repeat(2001)
      const request = new NextRequest("http://localhost:3000/api/courses/course-123/ratings", {
        method: "POST",
        body: JSON.stringify({
          rating: 5,
          review: longReview,
        }),
      })

      const response = await POST(request, { params: Promise.resolve({ id: "course-123" }) })
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toContain("too long")
    })
  })
})

