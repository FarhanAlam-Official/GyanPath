import { createServerClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"
import { ApiError } from "@/lib/utils/api-error"

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

    // Get group members with user details
    const { data: members, error } = await supabase
      .from("group_members")
      .select(
        `
        id,
        user_id,
        joined_at,
        user:profiles!group_members_user_id_fkey (
          id,
          full_name,
          email,
          avatar_url
        )
      `
      )
      .eq("group_id", groupId)

    if (error) {
      throw new ApiError(error.message, 400)
    }

    return NextResponse.json(members || [])
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode })
    }

    console.error("Group members error:", error)
    return NextResponse.json({ error: "Failed to fetch group members" }, { status: 500 })
  }
}

export async function POST(
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

    const body = await request.json()
    const { user_id } = body

    if (!user_id) {
      throw new ApiError("User ID is required", 400)
    }

    // Check if user exists
    const { data: targetUser } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", user_id)
      .single()

    if (!targetUser) {
      throw new ApiError("User not found", 404)
    }

    // Add member to group
    const { data: member, error } = await supabase
      .from("group_members")
      .insert({
        group_id: groupId,
        user_id: user_id,
      })
      .select()
      .single()

    if (error) {
      if (error.code === "23505") {
        throw new ApiError("User is already a member of this group", 400)
      }
      throw new ApiError(error.message, 400)
    }

    return NextResponse.json(member, { status: 201 })
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode })
    }

    console.error("Group members error:", error)
    return NextResponse.json({ error: "Failed to add member to group" }, { status: 500 })
  }
}

