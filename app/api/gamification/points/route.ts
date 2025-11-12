import { createServerClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"

const awardPointsSchema = z.object({
  user_id: z.string().uuid(),
  points: z.number().int().positive(),
  reason: z.string().min(1),
  source_type: z.string().optional(),
  source_id: z.string().uuid().optional(),
})

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

    // Get user points
    const { data: userPoints, error: pointsError } = await supabase
      .from("user_points")
      .select("*")
      .eq("user_id", userId)
      .single()

    if (pointsError && pointsError.code !== "PGRST116") {
      return NextResponse.json({ error: pointsError.message }, { status: 500 })
    }

    // Get points history
    const { data: history, error: historyError } = await supabase
      .from("points_history")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(50)

    if (historyError) {
      return NextResponse.json({ error: historyError.message }, { status: 500 })
    }

    return NextResponse.json({
      points: userPoints || { user_id: userId, total_points: 0, current_streak: 0, longest_streak: 0 },
      history: history || [],
    })
  } catch (error) {
    console.error("Error fetching points:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Only system can award points (or admins)
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

    if (!profile || profile.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await request.json()
    const validatedData = awardPointsSchema.parse(body)

    // Get or create user points record
    const { data: existingPoints } = await supabase
      .from("user_points")
      .select("*")
      .eq("user_id", validatedData.user_id)
      .single()

    const newTotalPoints = (existingPoints?.total_points || 0) + validatedData.points

    // Update or insert user points
    const { data: userPoints, error: pointsError } = await supabase
      .from("user_points")
      .upsert(
        {
          user_id: validatedData.user_id,
          total_points: newTotalPoints,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id" }
      )
      .select()
      .single()

    if (pointsError) {
      return NextResponse.json({ error: pointsError.message }, { status: 500 })
    }

    // Add to history
    await supabase.from("points_history").insert({
      user_id: validatedData.user_id,
      points: validatedData.points,
      reason: validatedData.reason,
      source_type: validatedData.source_type || null,
      source_id: validatedData.source_id || null,
    })

    return NextResponse.json({ points: userPoints }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid input", details: error.errors }, { status: 400 })
    }
    console.error("Error awarding points:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

