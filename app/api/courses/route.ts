import { createServerClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"

const createCourseSchema = z.object({
  title: z.string().min(3).max(200),
  title_ne: z.string().optional(),
  description: z.string().max(5000).optional(),
  description_ne: z.string().max(5000).optional(),
  category: z.string().optional(),
  difficulty_level: z.enum(["beginner", "intermediate", "advanced"]).optional(),
  estimated_duration_hours: z.number().min(0.5).max(1000).optional(),
  thumbnail_url: z.string().url().optional(),
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

    // Get user profile to check role
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 })
    }

    let query = supabase.from("courses").select("*")

    // If instructor, only show their courses
    if (profile.role === "instructor") {
      query = query.eq("instructor_id", user.id)
    }
    // If admin, show all courses
    // If learner, show only published courses
    else if (profile.role === "learner") {
      query = query.eq("is_published", true)
    }

    const { data: courses, error } = await query.order("created_at", { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ courses })
  } catch (error) {
    console.error("Error fetching courses:", error)
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

    // Get user profile to check role
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

    if (!profile || !["instructor", "admin"].includes(profile.role)) {
      return NextResponse.json({ error: "Only instructors can create courses" }, { status: 403 })
    }

    const body = await request.json()
    const validatedData = createCourseSchema.parse(body)

    const { data: course, error } = await supabase
      .from("courses")
      .insert({
        ...validatedData,
        instructor_id: user.id,
        is_published: false,
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ course }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid input", details: error.errors }, { status: 400 })
    }
    console.error("Error creating course:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
