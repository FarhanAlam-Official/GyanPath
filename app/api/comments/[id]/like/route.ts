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

    // Check if like already exists
    const { data: existingLike } = await supabase
      .from("comment_likes")
      .select("id")
      .eq("comment_id", id)
      .eq("user_id", user.id)
      .single()

    if (existingLike) {
      // Unlike: delete the like
      const { error } = await supabase
        .from("comment_likes")
        .delete()
        .eq("comment_id", id)
        .eq("user_id", user.id)

      if (error) {
        throw new ApiError(error.message, 400)
      }

      return NextResponse.json({ liked: false })
    } else {
      // Like: create the like
      const { error } = await supabase
        .from("comment_likes")
        .insert({
          comment_id: id,
          user_id: user.id,
        })

      if (error) {
        throw new ApiError(error.message, 400)
      }

      return NextResponse.json({ liked: true })
    }
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode })
    }

    console.error("Comment like error:", error)
    return NextResponse.json({ error: "Failed to toggle like" }, { status: 500 })
  }
}

