import { createServerClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"
import { ApiError } from "@/lib/utils/api-error"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params
    const supabase = await createServerClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      throw new ApiError("Unauthorized", 401)
    }

    // Check if vote already exists
    const { data: existingVote } = await supabase
      .from("rating_helpful_votes")
      .select("id")
      .eq("rating_id", id)
      .eq("user_id", user.id)
      .single()

    if (existingVote) {
      // Unvote: delete the vote
      const { error } = await supabase
        .from("rating_helpful_votes")
        .delete()
        .eq("rating_id", id)
        .eq("user_id", user.id)

      if (error) {
        throw new ApiError(error.message, 400)
      }

      return NextResponse.json({ helpful: false })
    } else {
      // Vote: create the vote
      const { error } = await supabase
        .from("rating_helpful_votes")
        .insert({
          rating_id: id,
          user_id: user.id,
        })

      if (error) {
        throw new ApiError(error.message, 400)
      }

      return NextResponse.json({ helpful: true })
    }
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode })
    }

    console.error("Rating helpful error:", error)
    return NextResponse.json({ error: "Failed to toggle helpful vote" }, { status: 500 })
  }
}

