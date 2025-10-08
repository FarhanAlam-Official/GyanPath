import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BookOpen, Clock, BarChart } from "lucide-react"
import Link from "next/link"
import type { Course } from "@/lib/types"

export default async function BrowseCoursesPage() {
  const supabase = await createClient()

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

  // Get all published courses
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

  const enrolledCourseIds = new Set(enrollments?.map((e) => e.course_id) || [])

  return (
    <DashboardLayout role="learner" userName={profile.full_name}>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-[#190482]">Browse Courses</h1>
          <p className="text-muted-foreground mt-2">Discover new courses and start learning</p>
        </div>

        {courses && courses.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course: Course & { instructor: { full_name: string } }) => {
              const isEnrolled = enrolledCourseIds.has(course.id)
              return (
                <Card key={course.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="aspect-video bg-gradient-to-br from-[#190482] to-[#7752FE] rounded-lg mb-4 flex items-center justify-center">
                      {course.thumbnail_url ? (
                        <img
                          src={course.thumbnail_url || "/placeholder.svg"}
                          alt={course.title}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        <BookOpen className="w-12 h-12 text-white" />
                      )}
                    </div>
                    <CardTitle className="line-clamp-2">{course.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {course.description || "No description"}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{course.estimated_duration_hours || "N/A"}h</span>
                      </div>
                      {course.difficulty_level && (
                        <div className="flex items-center gap-1">
                          <BarChart className="w-3 h-3" />
                          <span className="capitalize">{course.difficulty_level}</span>
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">By {course.instructor?.full_name || "Unknown"}</p>
                    <Button asChild className="w-full bg-[#7752FE] hover:bg-[#190482]" disabled={isEnrolled}>
                      <Link
                        href={isEnrolled ? `/learner/courses/${course.id}` : `/learner/courses/${course.id}/enroll`}
                      >
                        {isEnrolled ? "View Course" : "Enroll Now"}
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No courses available yet</p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}
