import { redirect, notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DashboardLayout } from "@/components/dashboard-layout"
import { CoursePreview } from "@/components/course-preview"

export default async function CoursePreviewPage({ params }: { params: Promise<{ courseId: string }> }) {
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
      <div className="max-w-4xl">
        <CoursePreview course={course} lessons={lessons || []} />
      </div>
    </DashboardLayout>
  )
}

