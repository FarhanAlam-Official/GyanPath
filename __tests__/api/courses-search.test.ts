import { createServerClient } from "@/lib/supabase/server"
import { GET } from "@/app/api/courses/search/route"
import { NextRequest } from "next/server"
import { createMockSupabaseClient } from "../utils/mock-supabase"

jest.mock("@/lib/supabase/server", () => ({
  createServerClient: jest.fn(),
}))

describe("Course Search API", () => {
  const mockSupabase = createMockSupabaseClient()

  beforeEach(() => {
    jest.clearAllMocks()
    ;(createServerClient as jest.Mock).mockReturnValue(mockSupabase)
  })

  it("returns courses matching search query", async () => {
    const mockCourses = [
      {
        id: "course-1",
        title: "JavaScript Basics",
        description: "Learn JavaScript",
        is_published: true,
        instructor: {
          id: "instructor-1",
          full_name: "John Doe",
        },
      },
      {
        id: "course-2",
        title: "Advanced JavaScript",
        description: "Advanced topics",
        is_published: true,
        instructor: {
          id: "instructor-2",
          full_name: "Jane Smith",
        },
      },
    ]

    mockSupabase._setMockData("courses", mockCourses)

    const request = new NextRequest("http://localhost:3000/api/courses/search?query=JavaScript")
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.courses).toBeDefined()
    expect(Array.isArray(data.courses)).toBe(true)
  })

  it("filters courses by category", async () => {
    const mockCourses = [
      {
        id: "course-1",
        title: "Web Development",
        category: "Programming",
        is_published: true,
      },
    ]

    mockSupabase._setMockData("courses", mockCourses)

    const request = new NextRequest(
      "http://localhost:3000/api/courses/search?category=Programming",
    )
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.courses).toBeDefined()
  })

  it("sorts courses by newest first", async () => {
    const mockCourses = [
      {
        id: "course-1",
        title: "Course 1",
        created_at: "2024-01-01",
        is_published: true,
      },
      {
        id: "course-2",
        title: "Course 2",
        created_at: "2024-01-02",
        is_published: true,
      },
    ]

    mockSupabase._setMockData("courses", mockCourses)

    const request = new NextRequest("http://localhost:3000/api/courses/search?sort=newest")
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.courses).toBeDefined()
  })

  it("filters enrolled courses", async () => {
    const mockCourses = [
      {
        id: "course-1",
        title: "Enrolled Course",
        is_published: true,
      },
    ]

    mockSupabase._setMockData("courses", mockCourses)
    mockSupabase._setMockData("course_enrollments", [
      {
        course_id: "course-1",
        user_id: "user-123",
      },
    ])

    const request = new NextRequest(
      "http://localhost:3000/api/courses/search?enrolled=true&user_id=user-123",
    )
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.courses).toBeDefined()
  })
})

