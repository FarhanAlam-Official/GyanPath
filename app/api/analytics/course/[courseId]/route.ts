import { createServerClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"
import { analyticsService } from "@/lib/analytics/service"
import { ApiError } from "@/lib/utils/api-error"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const { courseId } = await params
    const supabase = await createServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      throw new ApiError("Unauthorized", 401)
    }

    // Check if user is instructor of this course or admin
    const { data: course } = await supabase
      .from("courses")
      .select("instructor_id")
      .eq("id", courseId)
      .single()

    if (!course) {
      throw new ApiError("Course not found", 404)
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single()

    const isAdmin = profile?.role === "admin"
    const isInstructor = course.instructor_id === user.id

    if (!isAdmin && !isInstructor) {
      throw new ApiError("Forbidden", 403)
    }

    const analytics = await analyticsService.getCourseAnalytics(courseId)
    if (!analytics) {
      throw new ApiError("Course not found", 404)
    }

    return NextResponse.json(analytics)
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode })
    }

    console.error("Analytics error:", error)
    return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 })
  }
}

