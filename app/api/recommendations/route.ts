import { createServerClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"
import { RecommendationService } from "@/lib/recommendations/service"
import { cache, getCacheKey, CACHE_TTL } from "@/lib/utils/cache"

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
    const limit = parseInt(searchParams.get("limit") || "6", 10)
    const type = searchParams.get("type") || "personalized" // "personalized" or "trending"

    // Check cache for trending courses (not personalized)
    if (type === "trending") {
      const cacheKey = getCacheKey("recommendations-trending", limit)
      const cached = cache.get(cacheKey)
      if (cached) {
        return NextResponse.json(cached, {
          headers: {
            "X-Cache": "HIT",
            "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
          },
        })
      }
    }

    const recommendationService = new RecommendationService()

    let recommendations

    if (type === "trending") {
      recommendations = await recommendationService.getTrendingCourses(limit)
    } else {
      // Personalized recommendations - cache per user
      const cacheKey = getCacheKey("recommendations-personalized", user.id, limit)
      const cached = cache.get(cacheKey)
      if (cached) {
        return NextResponse.json(cached, {
          headers: {
            "X-Cache": "HIT",
            "Cache-Control": "private, s-maxage=300, stale-while-revalidate=600",
          },
        })
      }
      recommendations = await recommendationService.getRecommendations(user.id, limit)
    }

    const result = {
      recommendations,
      count: recommendations.length,
    }

    // Cache results
    if (type === "trending") {
      const cacheKey = getCacheKey("recommendations-trending", limit)
      cache.set(cacheKey, result, CACHE_TTL.MEDIUM)
    } else {
      const cacheKey = getCacheKey("recommendations-personalized", user.id, limit)
      cache.set(cacheKey, result, CACHE_TTL.MEDIUM)
    }

    return NextResponse.json(result, {
      headers: {
        "X-Cache": "MISS",
        "Cache-Control": type === "trending" ? "public, s-maxage=300, stale-while-revalidate=600" : "private, s-maxage=300, stale-while-revalidate=600",
      },
    })
  } catch (error) {
    console.error("Recommendation error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to get recommendations" },
      { status: 500 },
    )
  }
}

