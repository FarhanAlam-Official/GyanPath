import { createServerClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"
import { ApiError } from "@/lib/utils/api-error"
import type { UpdateGroupRequest } from "@/lib/types/api"

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

    const { data: group, error } = await supabase
      .from("groups")
      .select("*")
      .eq("id", groupId)
      .single()

    if (error || !group) {
      throw new ApiError("Group not found", 404)
    }

    return NextResponse.json(group)
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode })
    }

    console.error("Groups error:", error)
    return NextResponse.json({ error: "Failed to fetch group" }, { status: 500 })
  }
}

export async function PATCH(
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

    const body: UpdateGroupRequest = await request.json()

    const { data: updatedGroup, error } = await supabase
      .from("groups")
      .update({
        name: body.name,
        description: body.description,
      })
      .eq("id", groupId)
      .select()
      .single()

    if (error) {
      throw new ApiError(error.message, 400)
    }

    return NextResponse.json(updatedGroup)
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode })
    }

    console.error("Groups error:", error)
    return NextResponse.json({ error: "Failed to update group" }, { status: 500 })
  }
}

export async function DELETE(
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

    // Only admins can delete groups
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single()

    if (!profile || profile.role !== "admin") {
      throw new ApiError("Forbidden", 403)
    }

    const { error } = await supabase.from("groups").delete().eq("id", groupId)

    if (error) {
      throw new ApiError(error.message, 400)
    }

    return NextResponse.json({ message: "Group deleted successfully" })
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode })
    }

    console.error("Groups error:", error)
    return NextResponse.json({ error: "Failed to delete group" }, { status: 500 })
  }
}

