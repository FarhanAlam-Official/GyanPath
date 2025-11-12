import { redirect, notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DashboardLayout } from "@/components/dashboard-layout"
import { EditLessonForm } from "@/components/edit-lesson-form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText, Video, Link as LinkIcon } from "lucide-react"
import Link from "next/link"

export default async function LessonDetailPage({
  params,
}: {
  params: Promise<{ courseId: string; lessonId: string }>
}) {
  const { courseId, lessonId } = await params
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

  // Verify course ownership
  const { data: course } = await supabase
    .from("courses")
    .select("id, title, instructor_id")
    .eq("id", courseId)
    .eq("instructor_id", user.id)
    .single()

  if (!course) {
    notFound()
  }

  // Get lesson details
  const { data: lesson, error } = await supabase
    .from("lessons")
    .select("*")
    .eq("id", lessonId)
    .eq("course_id", courseId)
    .single()

  if (error || !lesson) {
    notFound()
  }

  // Get quiz for this lesson
  const { data: quiz } = await supabase
    .from("quizzes")
    .select("id, title, pass_percentage")
    .eq("lesson_id", lessonId)
    .single()

  return (
    <DashboardLayout role="instructor" userName={profile.full_name}>
      <div className="max-w-4xl space-y-8">
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
              <Link href={`/instructor/courses/${courseId}`} className="hover:text-foreground">
                {course.title}
              </Link>
              <span>/</span>
              <span>Lesson {lesson.order_index}</span>
            </div>
            <h1 className="text-3xl font-bold text-[#190482]">{lesson.title}</h1>
            <p className="text-muted-foreground mt-2">{lesson.description || "No description"}</p>
            <div className="flex gap-2 mt-4">
              <span
                className={`text-xs px-3 py-1 rounded ${
                  lesson.is_published ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                }`}
              >
                {lesson.is_published ? "Published" : "Draft"}
              </span>
            </div>
          </div>
        </div>

        {/* Lesson Resources */}
        <div className="grid md:grid-cols-2 gap-4">
          {lesson.video_url && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Video</CardTitle>
                <Video className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <a
                  href={lesson.video_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-[#7752FE] hover:underline flex items-center gap-2"
                >
                  <LinkIcon className="w-4 h-4" />
                  View Video
                </a>
                {lesson.video_duration_seconds && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Duration: {Math.floor(lesson.video_duration_seconds / 60)}:
                    {(lesson.video_duration_seconds % 60).toString().padStart(2, "0")}
                  </p>
                )}
              </CardContent>
            </Card>
          )}

          {lesson.pdf_url && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">PDF Document</CardTitle>
                <FileText className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <a
                  href={lesson.pdf_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-[#7752FE] hover:underline flex items-center gap-2"
                >
                  <LinkIcon className="w-4 h-4" />
                  View PDF
                </a>
              </CardContent>
            </Card>
          )}

          {quiz && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Quiz</CardTitle>
                <FileText className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <p className="text-sm font-medium mb-1">{quiz.title || "Untitled Quiz"}</p>
                <p className="text-xs text-muted-foreground mb-2">Pass: {quiz.pass_percentage}%</p>
                <Button asChild variant="outline" size="sm">
                  <Link href={`/instructor/courses/${courseId}/lessons/${lessonId}/quiz`}>Manage Quiz</Link>
                </Button>
              </CardContent>
            </Card>
          )}

          {!quiz && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Quiz</CardTitle>
                <FileText className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-2">No quiz for this lesson</p>
                <Button asChild variant="outline" size="sm">
                  <Link href={`/instructor/courses/${courseId}/lessons/${lessonId}/quiz/new`}>Create Quiz</Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Edit Form */}
        <div>
          <h2 className="text-2xl font-bold text-[#190482] mb-4">Edit Lesson</h2>
          <EditLessonForm lesson={lesson} courseId={courseId} />
        </div>
      </div>
    </DashboardLayout>
  )
}

