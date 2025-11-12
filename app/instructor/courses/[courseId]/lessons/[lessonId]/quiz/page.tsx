import { redirect, notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DashboardLayout } from "@/components/dashboard-layout"
import { QuizManagement } from "@/components/quiz-management"

export default async function QuizManagementPage({
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

  // Verify lesson ownership
  const { data: lesson } = await supabase
    .from("lessons")
    .select("id, title, course_id")
    .eq("id", lessonId)
    .eq("course_id", courseId)
    .single()

  if (!lesson) {
    notFound()
  }

  // Get quiz
  const { data: quiz } = await supabase
    .from("quizzes")
    .select(
      `
      *,
      questions:quiz_questions(
        *,
        options:quiz_options(*)
      )
    `
    )
    .eq("lesson_id", lessonId)
    .single()

  return (
    <DashboardLayout role="instructor" userName={profile.full_name}>
      <div className="max-w-4xl space-y-8">
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
              <a href={`/instructor/courses/${courseId}`} className="hover:text-foreground">
                {course.title}
              </a>
              <span>/</span>
              <a href={`/instructor/courses/${courseId}/lessons/${lessonId}`} className="hover:text-foreground">
                {lesson.title}
              </a>
              <span>/</span>
              <span>Quiz</span>
            </div>
            <h1 className="text-3xl font-bold text-[#190482]">
              {quiz ? `Manage Quiz: ${quiz.title || "Untitled"}` : "Create Quiz"}
            </h1>
            <p className="text-muted-foreground mt-2">
              {quiz?.description || "Add questions and configure quiz settings"}
            </p>
          </div>
        </div>

        <QuizManagement quizId={quiz?.id} lessonId={lessonId} courseId={courseId} initialQuiz={quiz} />
      </div>
    </DashboardLayout>
  )
}

