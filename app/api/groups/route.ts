import { createServerClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"
import { ApiError } from "@/lib/utils/api-error"
import type { CreateGroupRequest } from "@/lib/types/api"

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      throw new ApiError("Unauthorized", 401)
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single()

    // Admins can see all groups, group admins see only their groups
    if (profile?.role === "admin") {
      const { data: groups } = await supabase.from("groups").select("*").order("created_at", { ascending: false })
      return NextResponse.json(groups || [])
    } else if (profile?.role === "group_admin") {
      const { data: groups } = await supabase
        .from("groups")
        .select("*")
        .eq("group_admin_id", user.id)
        .order("created_at", { ascending: false })
      return NextResponse.json(groups || [])
    } else {
      throw new ApiError("Forbidden", 403)
    }
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode })
    }

    console.error("Groups error:", error)
    return NextResponse.json({ error: "Failed to fetch groups" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      throw new ApiError("Unauthorized", 401)
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single()

    // Only admins can create groups
    if (!profile || profile.role !== "admin") {
      throw new ApiError("Forbidden", 403)
    }

    const body: CreateGroupRequest = await request.json()

    if (!body.name) {
      throw new ApiError("Group name is required", 400)
    }

    // Get group_admin_id from body if provided, otherwise use current user
    const groupAdminId = body.group_admin_id || user.id

    const { data: group, error } = await supabase
      .from("groups")
      .insert({
        name: body.name,
        description: body.description,
        group_admin_id: groupAdminId,
      })
      .select()
      .single()

    if (error) {
      throw new ApiError(error.message, 400)
    }

    return NextResponse.json(group, { status: 201 })
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode })
    }

    console.error("Groups error:", error)
    return NextResponse.json({ error: "Failed to create group" }, { status: 500 })
  }
}

