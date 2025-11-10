import { createServerClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"

const updateLessonSchema = z.object({
  title: z.string().min(3).max(200).optional(),
  title_ne: z.string().optional(),
  description: z.string().max(5000).optional(),
  description_ne: z.string().max(5000).optional(),
  video_url: z.string().url().optional(),
  video_duration_seconds: z.number().optional(),
  pdf_url: z.string().url().optional(),
  order_index: z.number().min(1).optional(),
})

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

export async function GET(
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

    const { data: lesson, error } = await supabase
      .from("lessons")
      .select("*")
      .eq("id", lessonId)
      .eq("course_id", id)
      .single()

    if (error || !lesson) {
      return NextResponse.json({ error: "Lesson not found" }, { status: 404 })
    }

    return NextResponse.json({ lesson })
  } catch (error) {
    console.error("Error fetching lesson:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(
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

    const body = await request.json()
    const validatedData = updateLessonSchema.parse(body)

    const { data: updatedLesson, error } = await supabase
      .from("lessons")
      .update({
        ...validatedData,
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
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid input", details: error.errors }, { status: 400 })
    }
    console.error("Error updating lesson:", error)
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

    // Check if lesson is published
    const { data: lesson } = await supabase
      .from("lessons")
      .select("is_published")
      .eq("id", lessonId)
      .single()

    if (lesson?.is_published) {
      return NextResponse.json({ error: "Cannot delete published lessons" }, { status: 400 })
    }

    const { error } = await supabase.from("lessons").delete().eq("id", lessonId).eq("course_id", id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ message: "Lesson deleted successfully" })
  } catch (error) {
    console.error("Error deleting lesson:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
