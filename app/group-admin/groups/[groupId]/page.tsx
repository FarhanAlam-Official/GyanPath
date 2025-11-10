import { redirect } from "next/navigation"
import { createServerClient } from "@/lib/supabase/server"
import { DashboardLayout } from "@/components/dashboard-layout"
import { GroupAnalytics } from "@/components/group-analytics"
import { MemberManagement } from "@/components/member-management"
import { MemberProgressTable } from "@/components/member-progress-table"
import { AnnouncementBoard } from "@/components/announcement-board"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default async function GroupDetailPage({
  params,
}: {
  params: Promise<{ groupId: string }>
}) {
  const { groupId } = await params
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

  // Get group details
  const { data: group } = await supabase
    .from("groups")
    .select("*")
    .eq("id", groupId)
    .single()

  if (!group) {
    redirect("/group-admin")
  }

  // Check if user is the group admin
  if (group.group_admin_id !== user.id && profile.role !== "admin") {
    redirect("/group-admin")
  }

  // Get initial members
  const { data: initialMembers } = await supabase
    .from("group_members")
    .select(
      `
      id,
      user_id,
      joined_at,
      user:profiles!group_members_user_id_fkey(
        id,
        full_name,
        email,
        avatar_url
      )
    `
    )
    .eq("group_id", groupId)

  return (
    <DashboardLayout role="group_admin" userName={profile.full_name}>
      <div className="space-y-8">
        <div>
          <Button asChild variant="ghost" className="mb-4">
            <Link href="/group-admin">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Groups
            </Link>
          </Button>
          <h1 className="text-3xl font-bold text-[#190482]">{group.name}</h1>
          {group.description && <p className="text-muted-foreground mt-2">{group.description}</p>}
        </div>

        {/* Analytics Stats */}
        <GroupAnalytics groupId={groupId} />

        {/* Members Management */}
        <MemberManagement groupId={groupId} initialMembers={initialMembers || []} />

        {/* Member Progress */}
        <MemberProgressTable groupId={groupId} />

        {/* Announcements */}
        <AnnouncementBoard groupId={groupId} canCreate={true} />
      </div>
    </DashboardLayout>
  )
}

