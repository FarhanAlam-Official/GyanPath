import { createServerClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"
import { ApiError } from "@/lib/utils/api-error"

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ groupId: string; memberId: string }> }
) {
  try {
    const { groupId, memberId } = await params
    const supabase = await createServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      throw new ApiError("Unauthorized", 401)
    }

    // Check if user is admin or group admin
    const { data: group } = await supabase
      .from("groups")
      .select("group_admin_id")
      .eq("id", groupId)
      .single()

    if (!group) {
      throw new ApiError("Group not found", 404)
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single()

    const isAdmin = profile?.role === "admin"
    const isGroupAdmin = group.group_admin_id === user.id

    if (!isAdmin && !isGroupAdmin) {
      throw new ApiError("Forbidden", 403)
    }

    // Remove member from group
    const { error } = await supabase
      .from("group_members")
      .delete()
      .eq("id", memberId)
      .eq("group_id", groupId)

    if (error) {
      throw new ApiError(error.message, 400)
    }

    return NextResponse.json({ message: "Member removed successfully" })
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode })
    }

    console.error("Group members error:", error)
    return NextResponse.json({ error: "Failed to remove member from group" }, { status: 500 })
  }
}

