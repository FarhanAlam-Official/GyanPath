import { redirect, notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Video, FileText, Eye } from "lucide-react"
import Link from "next/link"
import { PublishCourseButton } from "@/components/publish-course-button"
import { LessonReorder } from "@/components/lesson-reorder"
import type { Lesson } from "@/lib/types"

export default async function CourseDetailPage({ params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  if (!profile || profile.role !== "instructor") {
    redirect("/auth/login")
  }

  // Get course details
  const { data: course, error } = await supabase
    .from("courses")
    .select("*")
    .eq("id", courseId)
    .eq("instructor_id", user.id)
    .single()

  if (error || !course) {
    notFound()
  }

  // Get lessons for this course
  const { data: lessons } = await supabase
    .from("lessons")
    .select("*")
    .eq("course_id", courseId)
    .order("order_index", { ascending: true })

  return (
    <DashboardLayout role="instructor" userName={profile.full_name}>
      <div className="space-y-8">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-[#190482]">{course.title}</h1>
            <p className="text-muted-foreground mt-2">{course.description || "No description"}</p>
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
            </div>
          </div>
          <div className="flex gap-2">
            <PublishCourseButton courseId={course.id} isPublished={course.is_published} />
            <Button asChild variant="outline">
              <Link href={`/instructor/courses/${courseId}/edit`}>Edit Course</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href={`/instructor/courses/${courseId}/preview`}>
                <Eye className="w-4 h-4 mr-2" />
                Preview
              </Link>
            </Button>
            <Button asChild className="bg-[#7752FE] hover:bg-[#190482]">
              <Link href={`/instructor/courses/${courseId}/lessons/new`}>
                <Plus className="w-4 h-4 mr-2" />
                Add Lesson
              </Link>
            </Button>
          </div>
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
              <FileText className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#7752FE]">0</div>
            </CardContent>
          </Card>
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
                  <div
                    key={lesson.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 rounded-full bg-[#C2D9FF] flex items-center justify-center text-[#190482] font-semibold">
                        {index + 1}
                      </div>
                      <div>
                        <h3 className="font-semibold">{lesson.title}</h3>
                        <p className="text-sm text-muted-foreground">{lesson.description || "No description"}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs px-2 py-1 rounded ${
                          lesson.is_published ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {lesson.is_published ? "Published" : "Draft"}
                      </span>
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/instructor/courses/${courseId}/lessons/${lesson.id}`}>Edit</Link>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Video className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">No lessons yet</p>
                <Button asChild className="bg-[#7752FE] hover:bg-[#190482]">
                  <Link href={`/instructor/courses/${courseId}/lessons/new`}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Your First Lesson
                  </Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Lesson Reorder */}
        {lessons && lessons.length > 0 && (
          <LessonReorder lessons={lessons} courseId={courseId} />
        )}
      </div>
    </DashboardLayout>
  )
}