import { createServerClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"
import { ApiError } from "@/lib/utils/api-error"
import { rateLimit, getClientIP } from "@/lib/utils/rate-limit"

export async function GET(request: NextRequest) {
  // Rate limiting
  const rateLimitResponse = await rateLimit({
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 60, // 60 requests per minute
    keyGenerator: (req) => getClientIP(req),
  })(request)

  if (rateLimitResponse) {
    return rateLimitResponse
  }
  try {
    const supabase = await createServerClient()
    const searchParams = request.nextUrl.searchParams
    const lessonId = searchParams.get("lesson_id")

    if (!lessonId) {
      throw new ApiError("lesson_id is required", 400)
    }

    // Get all comments for this lesson
    const { data: comments, error } = await supabase
      .from("lesson_comments")
      .select(
        `
        *,
        user:profiles(id, full_name, avatar_url)
      `,
      )
      .eq("lesson_id", lessonId)
      .is("parent_comment_id", null)
      .order("is_pinned", { ascending: false })
      .order("created_at", { ascending: false })

    if (error) {
      throw new ApiError(error.message, 500)
    }

    // Get user's likes
    const {
      data: { user },
    } = await supabase.auth.getUser()
    const userLikedCommentIds = new Set<string>()

    if (user) {
      const { data: likes } = await supabase
        .from("comment_likes")
        .select("comment_id")
        .eq("user_id", user.id)
        .in(
          "comment_id",
          comments?.map((c) => c.id) || [],
        )

      likes?.forEach((like) => userLikedCommentIds.add(like.comment_id))
    }

    // Get replies for each comment
    const commentIds = comments?.map((c) => c.id) || []
    const { data: replies } = await supabase
      .from("lesson_comments")
      .select(
        `
        *,
        user:profiles(id, full_name, avatar_url)
      `,
      )
      .in("parent_comment_id", commentIds)
      .order("created_at", { ascending: true })

    // Attach replies to parent comments
    const commentsWithReplies = comments?.map((comment) => {
      const commentReplies = replies?.filter((r) => r.parent_comment_id === comment.id) || []
      return {
        ...comment,
        replies: commentReplies,
        user_liked: userLikedCommentIds.has(comment.id),
      }
    })

    return NextResponse.json({ comments: commentsWithReplies || [] })
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode })
    }

    console.error("Comments error:", error)
    return NextResponse.json({ error: "Failed to fetch comments" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  // Rate limiting - stricter for POST
  const rateLimitResponse = await rateLimit({
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 10, // 10 requests per minute
    keyGenerator: (req) => getClientIP(req),
  })(request)

  if (rateLimitResponse) {
    return rateLimitResponse
  }

  try {
    const supabase = await createServerClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      throw new ApiError("Unauthorized", 401)
    }

    const body = await request.json()
    const { lesson_id, content, parent_comment_id } = body

    if (!lesson_id || !content) {
      throw new ApiError("lesson_id and content are required", 400)
    }

    // Input validation
    if (typeof content !== "string" || content.trim().length === 0) {
      throw new ApiError("Content cannot be empty", 400)
    }

    if (content.length > 5000) {
      throw new ApiError("Content is too long (max 5000 characters)", 400)
    }

    // Verify user is enrolled in the course
    const { data: lesson } = await supabase.from("lessons").select("course_id").eq("id", lesson_id).single()

    if (!lesson) {
      throw new ApiError("Lesson not found", 404)
    }

    const { data: enrollment } = await supabase
      .from("course_enrollments")
      .select("id")
      .eq("course_id", lesson.course_id)
      .eq("user_id", user.id)
      .single()

    if (!enrollment) {
      throw new ApiError("You must be enrolled in the course to comment", 403)
    }

    // Create comment
    const { data: comment, error } = await supabase
      .from("lesson_comments")
      .insert({
        lesson_id,
        user_id: user.id,
        content,
        parent_comment_id: parent_comment_id || null,
      })
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

    return NextResponse.json({ comment }, { status: 201 })
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode })
    }

    console.error("Comments error:", error)
    return NextResponse.json({ error: "Failed to create comment" }, { status: 500 })
  }
}

