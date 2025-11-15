import { createServerClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

async function verifyLessonOwnership(lessonId: string, courseId: string, userId: string, supabase: any) {
  const { data: lesson } = await supabase.from("lessons").select("course_id").eq("id", lessonId).single()

  if (!lesson || lesson.course_id !== courseId) {
    return false
  }

  const { data: course } = await supabase.from("courses").select("instructor_id").eq("id", courseId).single()

  if (!course) {
    return false
  }

  if (course.instructor_id !== userId) {
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", userId).single()
    return profile?.role === "admin"
  }

  return true
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; lessonId: string }> }
) {
  try {
    const { id, lessonId } = await params
    const supabase = await createServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const hasAccess = await verifyLessonOwnership(lessonId, id, user.id, supabase)
    if (!hasAccess) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { data: updatedLesson, error } = await supabase
      .from("lessons")
      .update({
        is_published: true,
        updated_at: new Date().toISOString(),
      })
      .eq("id", lessonId)
      .eq("course_id", id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ lesson: updatedLesson })
  } catch (error) {
    console.error("Error publishing lesson:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; lessonId: string }> }
) {
  try {
    const { id, lessonId } = await params
    const supabase = await createServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const hasAccess = await verifyLessonOwnership(lessonId, id, user.id, supabase)
    if (!hasAccess) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { data: updatedLesson, error } = await supabase
      .from("lessons")
      .update({
        is_published: false,
        updated_at: new Date().toISOString(),
      })
      .eq("id", lessonId)
      .eq("course_id", id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ lesson: updatedLesson })
  } catch (error) {
    console.error("Error unpublishing lesson:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
