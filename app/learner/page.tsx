import { redirect } from "next/navigation"
import { createServerClient } from "@/lib/supabase/server"
import { DashboardLayout } from "@/components/dashboard-layout"
import { AnalyticsUserStats } from "@/components/analytics-user-stats"
import { CourseRecommendations } from "@/components/course-recommendations"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BookOpen } from "lucide-react"
import Link from "next/link"

export default async function LearnerDashboard() {
  // eslint-disable-next-line no-console
  console.log("[LEARNER PAGE] Starting to render learner dashboard")
  const supabase = await createServerClient()

  // eslint-disable-next-line no-console
  console.log("[LEARNER PAGE] Getting user from server client...")
  const {
    data: { user },
  } = await supabase.auth.getUser()
  
  // eslint-disable-next-line no-console
  console.log("[LEARNER PAGE] User check result:", { hasUser: !!user, userId: user?.id })
  
  if (!user) {
    // eslint-disable-next-line no-console
    console.log("[LEARNER PAGE] No user found, redirecting to login")
    redirect("/auth/login")
  }

  // eslint-disable-next-line no-console
  console.log("[LEARNER PAGE] Fetching user profile...")
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()
  // eslint-disable-next-line no-console
  console.log("[LEARNER PAGE] Profile result:", { hasProfile: !!profile, role: profile?.role })

  if (!profile || profile.role !== "learner") {
    // eslint-disable-next-line no-console
    console.log("[LEARNER PAGE] Invalid profile or role, redirecting to login")
    redirect("/auth/login")
  }

  // eslint-disable-next-line no-console
  console.log("[LEARNER PAGE] Fetching enrollment count...")
  const { count: enrolledCount } = await supabase
    .from("course_enrollments")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)

  // Get enrolled course IDs for recommendations component
  const { data: enrollments } = await supabase
    .from("course_enrollments")
    .select("course_id")
    .eq("user_id", user.id)

  const enrolledCourseIds = enrollments?.map((e) => e.course_id) || []
  
  // eslint-disable-next-line no-console
  console.log("[LEARNER PAGE] Rendering dashboard with data:", { enrolledCount, enrolledCourseIds: enrolledCourseIds.length })

  return (
    <DashboardLayout role="learner" userName={profile.full_name}>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-[#190482]">Welcome back, {profile.full_name}!</h1>
          <p className="text-muted-foreground mt-2">Continue your learning journey</p>
        </div>

        {/* Stats Grid */}
        <AnalyticsUserStats />

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Continue Learning</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground mb-4">
                  {enrolledCount ? "View your enrolled courses" : "Start your learning journey"}
                </p>
                <Button asChild className="bg-[#7752FE] hover:bg-[#190482]">
                  <Link href="/learner/courses">{enrolledCount ? "My Courses" : "Browse Courses"}</Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Explore New Courses</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground mb-4">Discover courses that match your interests</p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button asChild className="bg-[#7752FE] hover:bg-[#190482]">
                    <Link href="/courses">Browse Course Catalogue</Link>
                  </Button>
                  <Button asChild variant="outline">
                    <Link href="/learner/browse">My Browse (Authenticated)</Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Course Recommendations */}
        <CourseRecommendations userId={user.id} enrolledCourseIds={enrolledCourseIds} limit={6} />
      </div>
    </DashboardLayout>
  )
}
