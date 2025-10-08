import { redirect, notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DashboardLayout } from "@/components/dashboard-layout"
import { CreateQuizForm } from "@/components/create-quiz-form"

export default async function NewQuizPage({
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

  // Verify lesson ownership
  const { data: lesson, error } = await supabase
    .from("lessons")
    .select(
      `
      *,
      course:courses!lessons_course_id_fkey(instructor_id)
    `,
    )
    .eq("id", lessonId)
    .eq("course_id", courseId)
    .single()

  if (error || !lesson || lesson.course.instructor_id !== user.id) {
    notFound()
  }

  return (
    <DashboardLayout role="instructor" userName={profile.full_name}>
      <div className="max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#190482]">Create Quiz</h1>
          <p className="text-muted-foreground mt-2">
            Lesson: <span className="font-medium">{lesson.title}</span>
          </p>
        </div>
        <CreateQuizForm lessonId={lessonId} courseId={courseId} />
      </div>
    </DashboardLayout>
  )
}
