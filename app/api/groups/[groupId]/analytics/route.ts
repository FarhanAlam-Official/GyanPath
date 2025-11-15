import { createServerClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

async function verifyGroupAdmin(groupId: string, userId: string, supabase: any) {
  const { data: group } = await supabase
    .from("groups")
    .select("group_admin_id")
    .eq("id", groupId)
    .single()

  if (!group) {
    return false
  }

  if (group.group_admin_id === userId) {
    return true
  }

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", userId).single()
  return profile?.role === "admin"
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ groupId: string }> }
) {
  try {
    const { groupId } = await params
    const supabase = await createServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (!(await verifyGroupAdmin(groupId, user.id, supabase))) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Get group members
    const { data: members } = await supabase
      .from("group_members")
      .select("user_id")
      .eq("group_id", groupId)

    const memberIds = members?.map((m) => m.user_id) || []

    // Get enrollment stats
    const { count: totalEnrollments } = await supabase
      .from("course_enrollments")
      .select("*", { count: "exact", head: true })
      .in("user_id", memberIds)

    // Get completion stats
    const { count: completedCourses } = await supabase
      .from("course_enrollments")
      .select("*", { count: "exact", head: true })
      .in("user_id", memberIds)
      .eq("completed", true)

    // Get certificate stats
    const { count: certificatesIssued } = await supabase
      .from("certificates")
      .select("*", { count: "exact", head: true })
      .in("user_id", memberIds)

    // Calculate average progress (simplified - would need proper progress calculation)
    const { data: enrollments } = await supabase
      .from("course_enrollments")
      .select("progress_percentage")
      .in("user_id", memberIds)

    const avgProgress =
      enrollments && enrollments.length > 0
        ? enrollments.reduce((sum, e) => sum + (e.progress_percentage || 0), 0) / enrollments.length
        : 0

    return NextResponse.json({
      totalMembers: memberIds.length,
      totalEnrollments: totalEnrollments || 0,
      completedCourses: completedCourses || 0,
      certificatesIssued: certificatesIssued || 0,
      averageProgress: Math.round(avgProgress),
    })
  } catch (error) {
    console.error("Error fetching group analytics:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

