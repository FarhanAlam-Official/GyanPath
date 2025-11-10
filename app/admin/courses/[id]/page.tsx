import { redirect, notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Video, FileText, Users } from "lucide-react"
import { PublishCourseButton } from "@/components/publish-course-button"
import { CourseModeration } from "@/components/course-moderation"
import type { Lesson } from "@/lib/types"

export default async function AdminCourseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  if (!profile || profile.role !== "admin") {
    redirect("/auth/login")
  }

  // Get course details with instructor info
  const { data: course, error } = await supabase
    .from("courses")
    .select(
      `
      *,
      instructor:profiles!courses_instructor_id_fkey(full_name, email)
    `,
    )
    .eq("id", id)
    .single()

  if (error || !course) {
    notFound()
  }

  // Get lessons for this course
  const { data: lessons } = await supabase
    .from("lessons")
    .select("*")
    .eq("course_id", id)
    .order("order_index", { ascending: true })

  // Get enrollment count
  const { count: enrollmentCount } = await supabase
    .from("course_enrollments")
    .select("*", { count: "exact", head: true })
    .eq("course_id", id)

  return (
    <DashboardLayout role="admin" userName={profile.full_name}>
      <div className="space-y-8">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-[#190482]">{course.title}</h1>
            <p className="text-muted-foreground mt-2">{course.description || "No description"}</p>
            <p className="text-sm text-muted-foreground mt-2">
              Instructor: {course.instructor?.full_name} ({course.instructor?.email})
            </p>
            <div className="flex gap-2 mt-4">
              <span
                className={`text-xs px-3 py-1 rounded ${
                  course.is_published ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                }`}
              >
                {course.is_published ? "Published" : "Draft"}
              </span>
              {course.difficulty_level && (
                <span className="text-xs px-3 py-1 rounded bg-blue-100 text-blue-700 capitalize">
                  {course.difficulty_level}
                </span>
              )}
              {course.category && (
                <span className="text-xs px-3 py-1 rounded bg-purple-100 text-purple-700">{course.category}</span>
              )}
            </div>
          </div>
          <PublishCourseButton courseId={course.id} isPublished={course.is_published} />
        </div>

        {/* Course Stats */}
        <div className="grid md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Lessons</CardTitle>
              <Video className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#7752FE]">{lessons?.length || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Published Lessons</CardTitle>
              <FileText className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#7752FE]">
                {lessons?.filter((l) => l.is_published).length || 0}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Enrolled Students</CardTitle>
              <Users className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#7752FE]">{enrollmentCount || 0}</div>
            </CardContent>
          </Card>
        </div>

        {/* Course Moderation */}
        <div className="grid md:grid-cols-2 gap-6">
          <CourseModeration course={course} />
        </div>

        {/* Lessons List */}
        <Card>
          <CardHeader>
            <CardTitle>Course Lessons</CardTitle>
          </CardHeader>
          <CardContent>
            {lessons && lessons.length > 0 ? (
              <div className="space-y-3">
                {lessons.map((lesson: Lesson, index: number) => (
                  <div key={lesson.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 rounded-full bg-[#C2D9FF] flex items-center justify-center text-[#190482] font-semibold">
                        {index + 1}
                      </div>
                      <div>
                        <h3 className="font-semibold">{lesson.title}</h3>
                        <p className="text-sm text-muted-foreground">{lesson.description || "No description"}</p>
                        {lesson.video_duration_seconds && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Duration: {Math.floor(lesson.video_duration_seconds / 60)} minutes
                          </p>
                        )}
                      </div>
                    </div>
                    <span
                      className={`text-xs px-2 py-1 rounded ${
                        lesson.is_published ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {lesson.is_published ? "Published" : "Draft"}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Video className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No lessons in this course yet</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
