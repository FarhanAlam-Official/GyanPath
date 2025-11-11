import { createServerClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"
import { ApiError } from "@/lib/utils/api-error"

export async function PUT(
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

    const body = await request.json()
    const { rating, review } = body

    if (!rating || rating < 1 || rating > 5) {
      throw new ApiError("Rating must be between 1 and 5", 400)
    }

    // Verify user owns the rating
    const { data: existingRating } = await supabase
      .from("course_ratings")
      .select("user_id")
      .eq("id", id)
      .single()

    if (!existingRating) {
      throw new ApiError("Rating not found", 404)
    }

    if (existingRating.user_id !== user.id) {
      throw new ApiError("You can only edit your own ratings", 403)
    }

    // Update rating
    const { data: updatedRating, error } = await supabase
      .from("course_ratings")
      .update({
        rating,
        review: review || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select(
        `
        *,
        user:profiles(id, full_name, avatar_url)
      `,
      )
      .single()

    if (error) {
      throw new ApiError(error.message, 400)
    }

    return NextResponse.json({ rating: updatedRating })
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode })
    }

    console.error("Ratings error:", error)
    return NextResponse.json({ error: "Failed to update rating" }, { status: 500 })
  }
}

export async function DELETE(
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

    // Verify user owns the rating
    const { data: rating } = await supabase
      .from("course_ratings")
      .select("user_id")
      .eq("id", id)
      .single()

    if (!rating) {
      throw new ApiError("Rating not found", 404)
    }

    if (rating.user_id !== user.id) {
      throw new ApiError("You can only delete your own ratings", 403)
    }

    // Delete rating
    const { error } = await supabase.from("course_ratings").delete().eq("id", id)

    if (error) {
      throw new ApiError(error.message, 400)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode })
    }

    console.error("Ratings error:", error)
    return NextResponse.json({ error: "Failed to delete rating" }, { status: 500 })
  }
}

