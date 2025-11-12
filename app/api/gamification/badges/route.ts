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
    const userId = searchParams.get("user_id") || user.id

    // Get all badges
    const { data: badges, error: badgesError } = await supabase.from("badges").select("*").order("name")

    if (badgesError) {
      return NextResponse.json({ error: badgesError.message }, { status: 500 })
    }

    // Get user's badges
    const { data: userBadges, error: userBadgesError } = await supabase
      .from("user_badges")
      .select("badge_id, earned_at")
      .eq("user_id", userId)

    if (userBadgesError) {
      return NextResponse.json({ error: userBadgesError.message }, { status: 500 })
    }

    const earnedBadgeIds = new Set(userBadges?.map((ub) => ub.badge_id) || [])

    // Combine badges with earned status
    const badgesWithStatus = badges?.map((badge) => ({
      ...badge,
      is_earned: earnedBadgeIds.has(badge.id),
      earned_at: userBadges?.find((ub) => ub.badge_id === badge.id)?.earned_at || null,
    }))

    return NextResponse.json({ badges: badgesWithStatus || [] })
  } catch (error) {
    console.error("Error fetching badges:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

