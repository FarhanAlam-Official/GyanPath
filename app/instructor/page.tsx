import { redirect } from "next/navigation"
import { createServerClient } from "@/lib/supabase/server"
import { DashboardLayout } from "@/components/dashboard-layout"
import { AnalyticsInstructorStats } from "@/components/analytics-instructor-stats"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen, Video, Users, FileText } from "lucide-react"

export default async function InstructorDashboard() {
  const supabase = await createServerClient()

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
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-[#190482]">Instructor Dashboard</h1>
          <p className="text-muted-foreground mt-2">Create and manage your courses and lessons</p>
        </div>

        {/* Stats Grid */}
        <AnalyticsInstructorStats />

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="grid md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg hover:bg-accent cursor-pointer transition-colors">
              <BookOpen className="w-8 h-8 text-[#7752FE] mb-2" />
              <h3 className="font-semibold">Create Course</h3>
              <p className="text-sm text-muted-foreground">Start a new course</p>
            </div>
            <div className="p-4 border rounded-lg hover:bg-accent cursor-pointer transition-colors">
              <Video className="w-8 h-8 text-[#7752FE] mb-2" />
              <h3 className="font-semibold">Add Lesson</h3>
              <p className="text-sm text-muted-foreground">Upload video lessons</p>
            </div>
            <div className="p-4 border rounded-lg hover:bg-accent cursor-pointer transition-colors">
              <FileText className="w-8 h-8 text-[#7752FE] mb-2" />
              <h3 className="font-semibold">Create Quiz</h3>
              <p className="text-sm text-muted-foreground">Add assessments</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
