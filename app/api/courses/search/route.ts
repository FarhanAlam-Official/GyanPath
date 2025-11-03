import { createServerClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"
import { cache, getCacheKey, CACHE_TTL } from "@/lib/utils/cache"
import type { Course } from "@/lib/types"

export interface SearchParams {
  query?: string
  category?: string
  difficulty?: string
  instructor_id?: string
  sort?: "newest" | "oldest" | "title_asc" | "title_desc" | "duration_asc" | "duration_desc"
  enrolled?: "true" | "false"
  user_id?: string
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerClient()
    const searchParams = request.nextUrl.searchParams

    // Get search parameters
    const query = searchParams.get("query") || ""
    const category = searchParams.get("category") || undefined
    const difficulty = searchParams.get("difficulty") || undefined
    const instructorId = searchParams.get("instructor_id") || undefined
    const sort = (searchParams.get("sort") as SearchParams["sort"]) || "newest"
    const enrolled = searchParams.get("enrolled") || undefined
    const userId = searchParams.get("user_id") || undefined

    // Check cache (only for non-user-specific queries)
    if (!enrolled && !userId) {
      const cacheKey = getCacheKey("courses-search", query, category, difficulty, instructorId, sort)
      const cached = cache.get<{ courses: Course[]; categories: string[]; total: number }>(cacheKey)
      if (cached) {
        return NextResponse.json(cached, {
          headers: {
            "X-Cache": "HIT",
            "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
          },
        })
      }
    }

    // Start with base query for published courses
    let coursesQuery = supabase
      .from("courses")
      .select(
        `
        *,
        instructor:profiles!courses_instructor_id_fkey(id, full_name, email)
      `,
      )
      .eq("is_published", true)

    // Apply text search (search in title and description)
    if (query) {
      coursesQuery = coursesQuery.or(
        `title.ilike.%${query}%,description.ilike.%${query}%,title_ne.ilike.%${query}%,description_ne.ilike.%${query}%`,
      )
    }

    // Apply filters
    if (category) {
      coursesQuery = coursesQuery.eq("category", category)
    }

    if (difficulty) {
      coursesQuery = coursesQuery.eq("difficulty_level", difficulty)
    }

    if (instructorId) {
      coursesQuery = coursesQuery.eq("instructor_id", instructorId)
    }

    // Apply sorting
    switch (sort) {
      case "newest":
        coursesQuery = coursesQuery.order("created_at", { ascending: false })
        break
      case "oldest":
        coursesQuery = coursesQuery.order("created_at", { ascending: true })
        break
      case "title_asc":
        coursesQuery = coursesQuery.order("title", { ascending: true })
        break
      case "title_desc":
        coursesQuery = coursesQuery.order("title", { ascending: false })
        break
      case "duration_asc":
        coursesQuery = coursesQuery.order("estimated_duration_hours", { ascending: true, nullsFirst: false })
        break
      case "duration_desc":
        coursesQuery = coursesQuery.order("estimated_duration_hours", { ascending: false, nullsFirst: false })
        break
      default:
        coursesQuery = coursesQuery.order("created_at", { ascending: false })
    }

    const { data: courses, error } = await coursesQuery

    if (error) {
      console.error("Search error:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Filter by enrollment status if requested
    let filteredCourses = courses || []

    if (enrolled && userId) {
      const { data: enrollments } = await supabase
        .from("course_enrollments")
        .select("course_id")
        .eq("user_id", userId)

      const enrolledCourseIds = new Set(enrollments?.map((e) => e.course_id) || [])

      if (enrolled === "true") {
        filteredCourses = filteredCourses.filter((course: Course) => enrolledCourseIds.has(course.id))
      } else if (enrolled === "false") {
        filteredCourses = filteredCourses.filter((course: Course) => !enrolledCourseIds.has(course.id))
      }
    }

    // Get unique categories for filter options
    const { data: allCourses } = await supabase
      .from("courses")
      .select("category")
      .eq("is_published", true)
      .not("category", "is", null)

    const categories = Array.from(new Set(allCourses?.map((c) => c.category).filter(Boolean) || [])).sort()

    const result = {
      courses: filteredCourses,
      categories,
      total: filteredCourses.length,
    }

    // Cache result (only for non-user-specific queries)
    if (!enrolled && !userId) {
      const cacheKey = getCacheKey("courses-search", query, category, difficulty, instructorId, sort)
      cache.set(cacheKey, result, CACHE_TTL.MEDIUM)
    }

    return NextResponse.json(result, {
      headers: {
        "X-Cache": "MISS",
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
      },
    })
  } catch (error) {
    console.error("Search error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to search courses" },
      { status: 500 },
    )
  }
}

