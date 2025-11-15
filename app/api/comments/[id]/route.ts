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
    const { content } = body

    if (!content) {
      throw new ApiError("content is required", 400)
    }

    // Verify user owns the comment
    const { data: comment } = await supabase
      .from("lesson_comments")
      .select("user_id")
      .eq("id", id)
      .single()

    if (!comment) {
      throw new ApiError("Comment not found", 404)
    }

    if (comment.user_id !== user.id) {
      throw new ApiError("You can only edit your own comments", 403)
    }

    // Update comment
    const { data: updatedComment, error } = await supabase
      .from("lesson_comments")
      .update({ content, updated_at: new Date().toISOString() })
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

    return NextResponse.json({ comment: updatedComment })
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode })
    }

    console.error("Comments error:", error)
    return NextResponse.json({ error: "Failed to update comment" }, { status: 500 })
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

    // Verify user owns the comment or is an instructor
    const { data: comment } = await supabase
      .from("lesson_comments")
      .select(
        `
        user_id,
        lesson:lessons!lesson_comments_lesson_id_fkey(
          course:courses!lessons_course_id_fkey(instructor_id)
        )
      `,
      )
      .eq("id", id)
      .single()

    if (!comment) {
      throw new ApiError("Comment not found", 404)
    }

    const isOwner = comment.user_id === user.id
    const isInstructor =
      comment.lesson?.course?.instructor_id === user.id

    if (!isOwner && !isInstructor) {
      throw new ApiError("You can only delete your own comments", 403)
    }

    // Delete comment (cascade will handle replies and likes)
    const { error } = await supabase.from("lesson_comments").delete().eq("id", id)

    if (error) {
      throw new ApiError(error.message, 400)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode })
    }

    console.error("Comments error:", error)
    return NextResponse.json({ error: "Failed to delete comment" }, { status: 500 })
  }
}

