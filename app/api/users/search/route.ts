import { createServerClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"
import { ApiError } from "@/lib/utils/api-error"

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      throw new ApiError("Unauthorized", 401)
    }

    const { searchParams } = new URL(request.url)
    const email = searchParams.get("email")

    if (!email) {
      throw new ApiError("Email is required", 400)
    }

    // Check if user is admin or group admin
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single()

    if (!profile || (profile.role !== "admin" && profile.role !== "group_admin")) {
      throw new ApiError("Forbidden", 403)
    }

    // Search for user by email
    const { data: userProfile, error } = await supabase
      .from("profiles")
      .select("id, email, full_name, avatar_url")
      .eq("email", email)
      .single()

    if (error || !userProfile) {
      throw new ApiError("User not found", 404)
    }

    return NextResponse.json(userProfile)
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode })
    }

    console.error("User search error:", error)
    return NextResponse.json({ error: "Failed to search user" }, { status: 500 })
  }
}

