import { redirect } from "next/navigation"
import { createServerClient } from "@/lib/supabase/server"
import { DashboardLayout } from "@/components/dashboard-layout"
import { AnalyticsDashboardStats } from "@/components/analytics-dashboard-stats"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, BookOpen, Award, TrendingUp } from "lucide-react"

export default async function AdminDashboard() {
  const supabase = await createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  if (!profile || profile.role !== "admin") {
    redirect("/auth/login")
  }

  return (
    <DashboardLayout role="admin" userName={profile.full_name}>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-[#190482]">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-2">Manage users, courses, and platform settings</p>
        </div>

        {/* Stats Grid */}
        <AnalyticsDashboardStats />

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="grid md:grid-cols-3 gap-4">
            <a href="/admin/users" className="p-4 border rounded-lg hover:bg-accent cursor-pointer transition-colors">
              <Users className="w-8 h-8 text-[#7752FE] mb-2" />
              <h3 className="font-semibold">Manage Users</h3>
              <p className="text-sm text-muted-foreground">View and manage user accounts</p>
            </a>
            <a href="/admin/courses" className="p-4 border rounded-lg hover:bg-accent cursor-pointer transition-colors">
              <BookOpen className="w-8 h-8 text-[#7752FE] mb-2" />
              <h3 className="font-semibold">Manage Courses</h3>
              <p className="text-sm text-muted-foreground">Moderate and approve courses</p>
            </a>
            <a href="/admin/analytics" className="p-4 border rounded-lg hover:bg-accent cursor-pointer transition-colors">
              <TrendingUp className="w-8 h-8 text-[#7752FE] mb-2" />
              <h3 className="font-semibold">View Analytics</h3>
              <p className="text-sm text-muted-foreground">Platform usage statistics</p>
            </a>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
