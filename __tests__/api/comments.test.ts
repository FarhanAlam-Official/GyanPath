import { createServerClient } from "@/lib/supabase/server"
import { GET, POST } from "@/app/api/comments/route"
import { NextRequest } from "next/server"
import { createMockSupabaseClient } from "../utils/mock-supabase"

// Mock the server client
jest.mock("@/lib/supabase/server", () => ({
  createServerClient: jest.fn(),
}))

describe("Comments API", () => {
  const mockSupabase = createMockSupabaseClient()

  beforeEach(() => {
    jest.clearAllMocks()
    ;(createServerClient as jest.Mock).mockReturnValue(mockSupabase)
  })

  describe("GET /api/comments", () => {
    it("returns comments for a lesson", async () => {
      const mockComments = [
        {
          id: "comment-1",
          lesson_id: "lesson-123",
          user_id: "user-123",
          content: "Great lesson!",
          likes_count: 5,
          created_at: new Date().toISOString(),
          user: {
            id: "user-123",
            full_name: "Test User",
          },
        },
      ]

      mockSupabase._setMockData("lesson_comments", mockComments)
      mockSupabase._getMockSingle().mockResolvedValue({
        data: mockComments.filter((c) => !c.user_id),
        error: null,
      })

      const request = new NextRequest("http://localhost:3000/api/comments?lesson_id=lesson-123")
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.comments).toBeDefined()
    })

    it("returns 400 when lesson_id is missing", async () => {
      const request = new NextRequest("http://localhost:3000/api/comments")
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toContain("lesson_id is required")
    })
  })

  describe("POST /api/comments", () => {
    it("creates a new comment", async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: {
          user: {
            id: "user-123",
          },
        },
      })

      mockSupabase._getMockFrom().mockReturnValue({
        select: jest.fn().mockResolvedValue({
          data: { course_id: "course-123" },
          error: null,
        }),
      })

      mockSupabase._getMockFrom().mockReturnValueOnce({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { id: "enrollment-123" },
          error: null,
        }),
      })

      mockSupabase._getMockFrom().mockReturnValueOnce({
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: {
            id: "comment-123",
            lesson_id: "lesson-123",
            content: "Test comment",
            user_id: "user-123",
          },
          error: null,
        }),
      })

      const request = new NextRequest("http://localhost:3000/api/comments", {
        method: "POST",
        body: JSON.stringify({
          lesson_id: "lesson-123",
          content: "Test comment",
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data.comment).toBeDefined()
    })

    it("returns 401 when user is not authenticated", async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: {
          user: null,
        },
      })

      const request = new NextRequest("http://localhost:3000/api/comments", {
        method: "POST",
        body: JSON.stringify({
          lesson_id: "lesson-123",
          content: "Test comment",
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toContain("Unauthorized")
    })

    it("validates comment content length", async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: {
          user: {
            id: "user-123",
          },
        },
      })

      const longContent = "a".repeat(5001)
      const request = new NextRequest("http://localhost:3000/api/comments", {
        method: "POST",
        body: JSON.stringify({
          lesson_id: "lesson-123",
          content: longContent,
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toContain("too long")
    })
  })
})

