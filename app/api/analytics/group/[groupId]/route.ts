import { createServerClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"
import { analyticsService } from "@/lib/analytics/service"
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

    // Check if user is group admin or admin
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

    const analytics = await analyticsService.getGroupAnalytics(groupId)
    return NextResponse.json(analytics)
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode })
    }

    console.error("Analytics error:", error)
    return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 })
  }
}

