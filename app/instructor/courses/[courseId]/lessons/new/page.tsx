import { redirect, notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DashboardLayout } from "@/components/dashboard-layout"
import { CreateLessonForm } from "@/components/create-lesson-form"

export default async function NewLessonPage({ params }: { params: Promise<{ courseId: string }> }) {
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

  // Verify course ownership
  const { data: course, error } = await supabase
    .from("courses")
    .select("*")
    .eq("id", courseId)
    .eq("instructor_id", user.id)
    .single()

  if (error || !course) {
    notFound()
  }

  // Get current lesson count for order_index
  const { count } = await supabase.from("lessons").select("*", { count: "exact", head: true }).eq("course_id", courseId)

  return (
    <DashboardLayout role="instructor" userName={profile.full_name}>
      <div className="max-w-3xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#190482]">Add New Lesson</h1>
          <p className="text-muted-foreground mt-2">
            Course: <span className="font-medium">{course.title}</span>
          </p>
        </div>
        <CreateLessonForm courseId={courseId} nextOrderIndex={(count || 0) + 1} />
      </div>
    </DashboardLayout>
  )
}