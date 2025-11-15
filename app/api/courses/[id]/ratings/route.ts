import { createServerClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"
import { ApiError } from "@/lib/utils/api-error"
import { rateLimit, getClientIP } from "@/lib/utils/rate-limit"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  // Rate limiting
  const rateLimitResponse = await rateLimit({
    windowMs: 60 * 1000,
    maxRequests: 60,
    keyGenerator: (req) => getClientIP(req),
  })(request)

  if (rateLimitResponse) {
    return rateLimitResponse
  }

  try {
    const { id: courseId } = await params
    const supabase = await createServerClient()
    const searchParams = request.nextUrl.searchParams
    const limit = parseInt(searchParams.get("limit") || "10", 10)
    const offset = parseInt(searchParams.get("offset") || "0", 10)

    // Get ratings for this course
    const { data: ratings, error } = await supabase
      .from("course_ratings")
      .select(
        `
        *,
        user:profiles(id, full_name, avatar_url)
      `,
      )
      .eq("course_id", courseId)
      .order("is_helpful_count", { ascending: false })
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      throw new ApiError(error.message, 500)
    }

    // Get user's helpful votes
    const {
      data: { user },
    } = await supabase.auth.getUser()
    const userHelpfulRatingIds = new Set<string>()

    if (user) {
      const { data: votes } = await supabase
        .from("rating_helpful_votes")
        .select("rating_id")
        .eq("user_id", user.id)
        .in(
          "rating_id",
          ratings?.map((r) => r.id) || [],
        )

      votes?.forEach((vote) => userHelpfulRatingIds.add(vote.rating_id))
    }

    // Attach user_helpful flag
    const ratingsWithHelpful = ratings?.map((rating) => ({
      ...rating,
      user_helpful: userHelpfulRatingIds.has(rating.id),
    }))

    // Get total count
    const { count } = await supabase
      .from("course_ratings")
      .select("*", { count: "exact", head: true })
      .eq("course_id", courseId)

    return NextResponse.json({
      ratings: ratingsWithHelpful || [],
      total: count || 0,
    })
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode })
    }

    console.error("Ratings error:", error)
    return NextResponse.json({ error: "Failed to fetch ratings" }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  // Rate limiting - stricter for POST
  const rateLimitResponse = await rateLimit({
    windowMs: 60 * 1000,
    maxRequests: 5, // 5 ratings per minute
    keyGenerator: (req) => getClientIP(req),
  })(request)

  if (rateLimitResponse) {
    return rateLimitResponse
  }

  try {
    const { id: courseId } = await params
    const supabase = await createServerClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      throw new ApiError("Unauthorized", 401)
    }

    const body = await request.json()
    const { rating, review } = body

    // Input validation
    if (!rating || typeof rating !== "number" || rating < 1 || rating > 5) {
      throw new ApiError("Rating must be between 1 and 5", 400)
    }

    if (review && typeof review === "string" && review.length > 2000) {
      throw new ApiError("Review is too long (max 2000 characters)", 400)
    }

    // Verify user is enrolled in the course
    const { data: enrollment } = await supabase
      .from("course_enrollments")
      .select("id")
      .eq("course_id", courseId)
      .eq("user_id", user.id)
      .single()

    if (!enrollment) {
      throw new ApiError("You must be enrolled in the course to rate it", 403)
    }

    // Upsert rating (user can update their rating)
    const { data: courseRating, error } = await supabase
      .from("course_ratings")
      .upsert(
        {
          course_id: courseId,
          user_id: user.id,
          rating,
          review: review || null,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "course_id,user_id",
        },
      )
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

    return NextResponse.json({ rating: courseRating }, { status: 201 })
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode })
    }

    console.error("Ratings error:", error)
    return NextResponse.json({ error: "Failed to create rating" }, { status: 500 })
  }
}

