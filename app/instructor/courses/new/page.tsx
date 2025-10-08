import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DashboardLayout } from "@/components/dashboard-layout"
import { CreateCourseForm } from "@/components/create-course-form"

export default async function NewCoursePage() {
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

  return (
    <DashboardLayout role="instructor" userName={profile.full_name}>
      <div className="max-w-3xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#190482]">Create New Course</h1>
          <p className="text-muted-foreground mt-2">Fill in the details to create your course</p>
        </div>
        <CreateCourseForm />
      </div>
    </DashboardLayout>
  )
}
