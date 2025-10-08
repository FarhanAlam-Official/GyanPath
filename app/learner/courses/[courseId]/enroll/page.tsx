import { redirect, notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { EnrollButton } from "@/components/enroll-button"
import { BookOpen, Clock, BarChart, Award } from "lucide-react"

export default async function EnrollPage({ params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = await params
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

  // Get course details
  const { data: course, error } = await supabase
    .from("courses")
    .select(
      `
      *,
      instructor:profiles!courses_instructor_id_fkey(full_name)
    `,
    )
    .eq("id", courseId)
    .eq("is_published", true)
    .single()

  if (error || !course) {
    notFound()
  }

  // Check if already enrolled
  const { data: enrollment } = await supabase
    .from("course_enrollments")
    .select("*")
    .eq("course_id", courseId)
    .eq("user_id", user.id)
    .single()

  if (enrollment) {
    redirect(`/learner/courses/${courseId}`)
  }

  // Get lesson count
  const { count: lessonCount } = await supabase
    .from("lessons")
    .select("*", { count: "exact", head: true })
    .eq("course_id", courseId)
    .eq("is_published", true)

  return (
    <DashboardLayout role="learner" userName={profile.full_name}>
      <div className="max-w-4xl mx-auto space-y-8">
        <Card>
          <CardHeader>
            <div className="aspect-video bg-gradient-to-br from-[#190482] to-[#7752FE] rounded-lg mb-6 flex items-center justify-center">
              {course.thumbnail_url ? (
                <img
                  src={course.thumbnail_url || "/placeholder.svg"}
                  alt={course.title}
                  className="w-full h-full object-cover rounded-lg"
                />
              ) : (
                <BookOpen className="w-24 h-24 text-white" />
              )}
            </div>
            <CardTitle className="text-3xl text-[#190482]">{course.title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-muted-foreground">{course.description || "No description available"}</p>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-4 bg-accent rounded-lg">
                <Clock className="w-8 h-8 text-[#7752FE]" />
                <div>
                  <p className="text-sm text-muted-foreground">Duration</p>
                  <p className="font-semibold">{course.estimated_duration_hours || "N/A"} hours</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-accent rounded-lg">
                <BarChart className="w-8 h-8 text-[#7752FE]" />
                <div>
                  <p className="text-sm text-muted-foreground">Difficulty</p>
                  <p className="font-semibold capitalize">{course.difficulty_level || "Not specified"}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-accent rounded-lg">
                <BookOpen className="w-8 h-8 text-[#7752FE]" />
                <div>
                  <p className="text-sm text-muted-foreground">Lessons</p>
                  <p className="font-semibold">{lessonCount || 0} lessons</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-accent rounded-lg">
                <Award className="w-8 h-8 text-[#7752FE]" />
                <div>
                  <p className="text-sm text-muted-foreground">Certificate</p>
                  <p className="font-semibold">Upon completion</p>
                </div>
              </div>
            </div>

            <div className="border-t pt-6">
              <p className="text-sm text-muted-foreground mb-2">Instructor</p>
              <p className="font-semibold">{course.instructor?.full_name || "Unknown"}</p>
            </div>

            <EnrollButton courseId={course.id} />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}