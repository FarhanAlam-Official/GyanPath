import { redirect, notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DashboardLayout } from "@/components/dashboard-layout"
import { QuizTaker } from "@/components/quiz-taker"

export default async function TakeQuizPage({
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

  if (!profile || profile.role !== "learner") {
    redirect("/auth/login")
  }

  // Check enrollment
  const { data: enrollment } = await supabase
    .from("course_enrollments")
    .select("*")
    .eq("course_id", courseId)
    .eq("user_id", user.id)
    .single()

  if (!enrollment) {
    redirect(`/learner/courses/${courseId}/enroll`)
  }

  // Get quiz
  const { data: quiz, error } = await supabase
    .from("quizzes")
    .select("*")
    .eq("lesson_id", lessonId)
    .eq("is_published", true)
    .single()

  if (error || !quiz) {
    notFound()
  }

  // Get questions with options
  const { data: questions } = await supabase
    .from("quiz_questions")
    .select(
      `
      *,
      options:quiz_options(*)
    `,
    )
    .eq("quiz_id", quiz.id)
    .order("order_index", { ascending: true })

  // Get previous attempts
  const { data: attempts } = await supabase
    .from("quiz_attempts")
    .select("*")
    .eq("quiz_id", quiz.id)
    .eq("user_id", user.id)
    .order("completed_at", { ascending: false })

  return (
    <DashboardLayout role="learner" userName={profile.full_name}>
      <div className="max-w-4xl mx-auto">
        <QuizTaker
          quiz={quiz}
          questions={questions || []}
          previousAttempts={attempts || []}
          courseId={courseId}
          lessonId={lessonId}
        />
      </div>
    </DashboardLayout>
  )
}
