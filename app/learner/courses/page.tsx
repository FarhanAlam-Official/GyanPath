import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BookOpen, TrendingUp } from "lucide-react"
import Link from "next/link"
import { Progress } from "@/components/ui/progress"
import type { Course, CourseEnrollment } from "@/lib/types"

export default async function MyCoursesPage() {
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

  // Get user's enrolled courses
  const { data: enrollments } = await supabase
    .from("course_enrollments")
    .select(
      `
      *,
      course:courses(
        *,
        instructor:profiles!courses_instructor_id_fkey(full_name)
      )
    `,
    )
    .eq("user_id", user.id)
    .order("enrolled_at", { ascending: false })

  return (
    <DashboardLayout role="learner" userName={profile.full_name}>
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-[#190482]">My Courses</h1>
            <p className="text-muted-foreground mt-2">Continue your learning journey</p>
          </div>
          <Button asChild className="bg-[#7752FE] hover:bg-[#190482]">
            <Link href="/learner/browse">Browse Courses</Link>
          </Button>
        </div>

        {enrollments && enrollments.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {enrollments.map(
              (enrollment: CourseEnrollment & { course: Course & { instructor: { full_name: string } } }) => {
                const course = enrollment.course
                return (
                  <Card key={enrollment.id} className="hover:shadow-lg transition-shadow">
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
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Progress</span>
                          <span className="font-semibold text-[#7752FE]">{enrollment.progress_percentage}%</span>
                        </div>
                        <Progress value={enrollment.progress_percentage} className="h-2" />
                      </div>
                      {enrollment.completed_at ? (
                        <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 p-2 rounded">
                          <TrendingUp className="w-4 h-4" />
                          <span>Completed</span>
                        </div>
                      ) : null}
                      <Button asChild className="w-full bg-[#7752FE] hover:bg-[#190482]">
                        <Link href={`/learner/courses/${course.id}`}>Continue Learning</Link>
                      </Button>
                    </CardContent>
                  </Card>
                )
              },
            )}
          </div>
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">You haven&apos;t enrolled in any courses yet</p>
              <Button asChild className="bg-[#7752FE] hover:bg-[#190482]">
                <Link href="/learner/browse">Browse Courses</Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}
