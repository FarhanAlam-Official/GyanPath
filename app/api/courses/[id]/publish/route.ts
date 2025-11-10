import { createServerClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const supabase = await createServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check course ownership
    const { data: course } = await supabase
      .from("courses")
      .select("instructor_id, is_published")
      .eq("id", id)
      .single()

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 })
    }

    if (course.instructor_id !== user.id) {
      const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()
      if (profile?.role !== "admin") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 })
      }
    }

    // Check if course has at least one published lesson
    const { count: publishedLessons } = await supabase
      .from("lessons")
      .select("*", { count: "exact", head: true })
      .eq("course_id", id)
      .eq("is_published", true)

    if (!publishedLessons || publishedLessons === 0) {
      return NextResponse.json(
        { error: "Course must have at least one published lesson" },
        { status: 400 }
      )
    }

    const { data: updatedCourse, error } = await supabase
      .from("courses")
      .update({
        is_published: true,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ course: updatedCourse })
  } catch (error) {
    console.error("Error publishing course:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const supabase = await createServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check course ownership
    const { data: course } = await supabase.from("courses").select("instructor_id").eq("id", id).single()

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 })
    }

    if (course.instructor_id !== user.id) {
      const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()
      if (profile?.role !== "admin") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 })
      }
    }

    const { data: updatedCourse, error } = await supabase
      .from("courses")
      .update({
        is_published: false,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ course: updatedCourse })
  } catch (error) {
    console.error("Error unpublishing course:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
