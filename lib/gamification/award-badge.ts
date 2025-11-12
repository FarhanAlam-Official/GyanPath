import { createClient } from "@/lib/supabase/client"

/**
 * Award a badge to a user
 */
export async function awardBadge(userId: string, badgeId: string): Promise<void> {
  const supabase = createClient()

  // Check if user already has this badge
  const { data: existing } = await supabase
    .from("user_badges")
    .select("id")
    .eq("user_id", userId)
    .eq("badge_id", badgeId)
    .single()

  if (existing) {
    return // Already has the badge
  }

  // Award the badge
  await supabase.from("user_badges").insert({
    user_id: userId,
    badge_id: badgeId,
  })
}

/**
 * Award points to a user
 */
export async function awardPoints(
  userId: string,
  points: number,
  reason: string,
  sourceType?: string,
  sourceId?: string
): Promise<void> {
  const supabase = createClient()

  // Get or create user points record
  const { data: existingPoints } = await supabase
    .from("user_points")
    .select("*")
    .eq("user_id", userId)
    .single()

  const newTotalPoints = (existingPoints?.total_points || 0) + points

  // Update user points
  await supabase
    .from("user_points")
    .upsert(
      {
        user_id: userId,
        total_points: newTotalPoints,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" }
    )

  // Add to history
  await supabase.from("points_history").insert({
    user_id: userId,
    points,
    reason,
    source_type: sourceType || null,
    source_id: sourceId || null,
  })
}

/**
 * Update user streak
 */
export async function updateStreak(userId: string): Promise<void> {
  const supabase = createClient()

  const today = new Date().toISOString().split("T")[0]

  // Get user points
  const { data: userPoints } = await supabase
    .from("user_points")
    .select("*")
    .eq("user_id", userId)
    .single()

  if (!userPoints) {
    // Create initial record
    await supabase.from("user_points").insert({
      user_id: userId,
      total_points: 0,
      current_streak: 1,
      longest_streak: 1,
      last_activity_date: today,
    })
    return
  }

  const lastActivity = userPoints.last_activity_date
    ? new Date(userPoints.last_activity_date).toISOString().split("T")[0]
    : null

  let currentStreak = userPoints.current_streak || 0
  let longestStreak = userPoints.longest_streak || 0

  if (lastActivity === today) {
    // Already updated today
    return
  }

  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  const yesterdayStr = yesterday.toISOString().split("T")[0]

  if (lastActivity === yesterdayStr) {
    // Continue streak
    currentStreak += 1
  } else {
    // Reset streak
    currentStreak = 1
  }

  if (currentStreak > longestStreak) {
    longestStreak = currentStreak
  }

  // Update streak
  await supabase
    .from("user_points")
    .update({
      current_streak: currentStreak,
      longest_streak: longestStreak,
      last_activity_date: today,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", userId)
}

