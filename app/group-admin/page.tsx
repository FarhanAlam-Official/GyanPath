import { redirect } from "next/navigation"
import { createServerClient } from "@/lib/supabase/server"
import { DashboardLayout } from "@/components/dashboard-layout"
import { GroupList } from "@/components/group-list"
import { CreateGroupForm } from "@/components/create-group-form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, TrendingUp } from "lucide-react"

export default async function GroupAdminDashboard() {
  const supabase = await createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  if (!profile || profile.role !== "group_admin") {
    redirect("/auth/login")
  }

  // Get groups managed by this admin
  const { data: groups } = await supabase.from("groups").select("*").eq("group_admin_id", user.id)

  // Calculate total members across all groups
  const groupIds = groups?.map((g) => g.id) || []
  const { count: totalMembers } =
    groupIds.length > 0
      ? await supabase
          .from("group_members")
          .select("*", { count: "exact", head: true })
          .in("group_id", groupIds)
      : { count: 0 }

  return (
    <DashboardLayout role="group_admin" userName={profile.full_name}>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[#190482]">Group Admin Dashboard</h1>
            <p className="text-muted-foreground mt-2">Manage your groups and track member progress</p>
          </div>
          {profile.role === "admin" && <CreateGroupForm />}
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">My Groups</CardTitle>
              <Users className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#7752FE]">{groups?.length || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">Groups you manage</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Members</CardTitle>
              <Users className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#7752FE]">{totalMembers || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">Across all groups</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Avg. Progress</CardTitle>
              <TrendingUp className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#7752FE]">--</div>
              <p className="text-xs text-muted-foreground mt-1">Group completion rate</p>
            </CardContent>
          </Card>
        </div>

        {/* Groups List */}
        <Card>
          <CardHeader>
            <CardTitle>Your Groups</CardTitle>
          </CardHeader>
          <CardContent>
            <GroupList />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
