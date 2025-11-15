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

    // Get group members with their profiles
    const { data: members } = await supabase
      .from("group_members")
      .select(
        `
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

    if (!members) {
      return NextResponse.json({ members: [] })
    }

    // Get progress for each member
    const memberIds = members.map((m) => m.user_id)
    const { data: enrollments } = await supabase
      .from("course_enrollments")
      .select("user_id, progress_percentage, completed, course_id")
      .in("user_id", memberIds)

    // Get certificates for each member
    const { data: certificates } = await supabase
      .from("certificates")
      .select("user_id, course_id, issued_at")
      .in("user_id", memberIds)

    // Combine data
    const membersWithProgress = members.map((member) => {
      const memberEnrollments = enrollments?.filter((e) => e.user_id === member.user_id) || []
      const memberCertificates = certificates?.filter((c) => c.user_id === member.user_id) || []

      const totalCourses = memberEnrollments.length
      const completedCourses = memberEnrollments.filter((e) => e.completed).length
      const avgProgress =
        memberEnrollments.length > 0
          ? memberEnrollments.reduce((sum, e) => sum + (e.progress_percentage || 0), 0) /
            memberEnrollments.length
          : 0

      return {
        ...member,
        stats: {
          totalCourses,
          completedCourses,
          certificates: memberCertificates.length,
          averageProgress: Math.round(avgProgress),
        },
      }
    })

    return NextResponse.json({ members: membersWithProgress })
  } catch (error) {
    console.error("Error fetching member progress:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

