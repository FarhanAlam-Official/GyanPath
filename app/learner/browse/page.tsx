import { redirect } from "next/navigation"
import { createServerClient } from "@/lib/supabase/server"
import { DashboardLayout } from "@/components/dashboard-layout"
import { CourseBrowseContent } from "@/components/course-browse-content"
import { CourseRecommendations } from "@/components/course-recommendations"
import type { Course } from "@/lib/types"

export default async function BrowseCoursesPage() {
  const supabase = await createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  if (!profile || profile.role !== "learner") {
    redirect("/auth/login")
  }

  // Get all published courses (for initial server-side rendering)
  const { data: courses } = await supabase
    .from("courses")
    .select(
      `
      *,
      instructor:profiles!courses_instructor_id_fkey(full_name)
    `,
    )
    .eq("is_published", true)
    .order("created_at", { ascending: false })

  // Get user's enrollments
  const { data: enrollments } = await supabase.from("course_enrollments").select("course_id").eq("user_id", user.id)

  const enrolledCourseIds = enrollments?.map((e) => e.course_id) || []

  // Get unique categories for filters
  const { data: allCourses } = await supabase
    .from("courses")
    .select("category")
    .eq("is_published", true)
    .not("category", "is", null)

  const categories = Array.from(new Set(allCourses?.map((c) => c.category).filter(Boolean) || [])).sort()

  return (
    <DashboardLayout role="learner" userName={profile.full_name}>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-[#190482]">Browse Courses</h1>
          <p className="text-muted-foreground mt-2">Discover new courses and start learning</p>
        </div>

        {/* Course Recommendations */}
        <CourseRecommendations userId={user.id} enrolledCourseIds={enrolledCourseIds} limit={6} />

        <CourseBrowseContent
          initialCourses={(courses as (Course & { instructor: { full_name: string } })[]) || []}
          initialCategories={categories}
          userId={user.id}
          enrolledCourseIds={enrolledCourseIds}
        />
      </div>
    </DashboardLayout>
  )
}
