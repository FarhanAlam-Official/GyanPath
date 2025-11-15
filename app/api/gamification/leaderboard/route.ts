import { createServerClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const type = searchParams.get("type") || "global"
    const courseId = searchParams.get("course_id")
    const groupId = searchParams.get("group_id")
    const period = searchParams.get("period") || "all_time"
    const limit = Number.parseInt(searchParams.get("limit") || "100")

    let query = supabase
      .from("user_points")
      .select(
        `
        *,
        user:profiles!user_points_user_id_fkey(id, full_name, email, avatar_url)
      `
      )
      .order("total_points", { ascending: false })
      .limit(limit)

    // Filter by course or group if specified
    if (courseId || groupId) {
      // For course/group leaderboards, we'd need to join with enrollments or group_members
      // For now, return global leaderboard
    }

    const { data: leaderboard, error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Add rank
    const leaderboardWithRank = leaderboard?.map((entry, index) => ({
      ...entry,
      rank: index + 1,
    }))

    return NextResponse.json({ leaderboard: leaderboardWithRank || [] })
  } catch (error) {
    console.error("Error fetching leaderboard:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

