import { createServerClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

    if (!profile) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const searchParams = request.nextUrl.searchParams
    const type = searchParams.get("type") || "overview"
    const courseId = searchParams.get("course_id")
    const startDate = searchParams.get("start_date")
    const endDate = searchParams.get("end_date")

    let report: any = {}

    switch (type) {
      case "overview":
        // Overall platform statistics
        const { count: totalUsers } = await supabase
          .from("profiles")
          .select("*", { count: "exact", head: true })

        const { count: totalCourses } = await supabase
          .from("courses")
          .select("*", { count: "exact", head: true })
          .eq("is_published", true)

        const { count: totalEnrollments } = await supabase
          .from("course_enrollments")
          .select("*", { count: "exact", head: true })

        const { count: totalCertificates } = await supabase
          .from("certificates")
          .select("*", { count: "exact", head: true })

        report = {
          totalUsers: totalUsers || 0,
          totalCourses: totalCourses || 0,
          totalEnrollments: totalEnrollments || 0,
          totalCertificates: totalCertificates || 0,
        }
        break

      case "course_performance":
        if (!courseId) {
          return NextResponse.json({ error: "course_id required" }, { status: 400 })
        }

        // Course-specific analytics
        const { count: enrollments } = await supabase
          .from("course_enrollments")
          .select("*", { count: "exact", head: true })
          .eq("course_id", courseId)

        const { count: completions } = await supabase
          .from("course_enrollments")
          .select("*", { count: "exact", head: true })
          .eq("course_id", courseId)
          .eq("completed", true)

        const { data: enrollmentsData } = await supabase
          .from("course_enrollments")
          .select("progress_percentage, created_at")
          .eq("course_id", courseId)

        const avgProgress =
          enrollmentsData && enrollmentsData.length > 0
            ? enrollmentsData.reduce((sum, e) => sum + (e.progress_percentage || 0), 0) / enrollmentsData.length
            : 0

        // Enrollment over time
        const enrollmentByDate = new Map<string, number>()
        enrollmentsData?.forEach((e) => {
          const date = new Date(e.created_at).toISOString().split("T")[0]
          enrollmentByDate.set(date, (enrollmentByDate.get(date) || 0) + 1)
        })

        report = {
          totalEnrollments: enrollments || 0,
          totalCompletions: completions || 0,
          completionRate: enrollments ? ((completions || 0) / enrollments) * 100 : 0,
          averageProgress: Math.round(avgProgress),
          enrollmentOverTime: Array.from(enrollmentByDate.entries()).map(([date, count]) => ({ date, count })),
        }
        break

      case "user_engagement":
        // User engagement metrics
        const { count: activeUsers } = await supabase
          .from("profiles")
          .select("*", { count: "exact", head: true })
          .gte("updated_at", new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())

        const { count: recentEnrollments } = await supabase
          .from("course_enrollments")
          .select("*", { count: "exact", head: true })
          .gte("created_at", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())

        report = {
          activeUsers30Days: activeUsers || 0,
          newEnrollments7Days: recentEnrollments || 0,
        }
        break

      default:
        return NextResponse.json({ error: "Invalid report type" }, { status: 400 })
    }

    return NextResponse.json({ report })
  } catch (error) {
    console.error("Error generating report:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

