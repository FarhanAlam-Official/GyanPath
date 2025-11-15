import { createServerClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"

const createQuizSchema = z.object({
  title: z.string().min(3).max(200),
  title_ne: z.string().optional(),
  description: z.string().max(5000).optional(),
  description_ne: z.string().max(5000).optional(),
  passing_score: z.number().min(0).max(100).default(70),
  time_limit_minutes: z.number().optional(),
  shuffle_questions: z.boolean().default(false),
  allow_retry: z.boolean().default(true),
  retry_cooldown_hours: z.number().optional(),
  show_explanations: z.boolean().default(true),
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

    const { data: quiz, error } = await supabase
      .from("quizzes")
      .select(
        `
        *,
        questions:quiz_questions(
          *,
          options:quiz_options(*)
        )
      `
      )
      .eq("lesson_id", lessonId)
      .single()

    if (error) {
      // No quiz found, return null
      return NextResponse.json({ quiz: null })
    }

    return NextResponse.json({ quiz })
  } catch (error) {
    console.error("Error fetching quiz:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
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

    const body = await request.json()
    const validatedData = createQuizSchema.parse(body)

    // Check if quiz already exists for this lesson
    const { data: existingQuiz } = await supabase
      .from("quizzes")
      .select("id")
      .eq("lesson_id", lessonId)
      .single()

    if (existingQuiz) {
      return NextResponse.json({ error: "Quiz already exists for this lesson" }, { status: 400 })
    }

    const { data: quiz, error } = await supabase
      .from("quizzes")
      .insert({
        ...validatedData,
        lesson_id: lessonId,
        is_published: false,
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ quiz }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid input", details: error.errors }, { status: 400 })
    }
    console.error("Error creating quiz:", error)
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
    const validatedData = createQuizSchema.parse(body)

    const { data: updatedQuiz, error } = await supabase
      .from("quizzes")
      .update({
        ...validatedData,
        updated_at: new Date().toISOString(),
      })
      .eq("lesson_id", lessonId)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ quiz: updatedQuiz })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid input", details: error.errors }, { status: 400 })
    }
    console.error("Error updating quiz:", error)
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

    const { error } = await supabase.from("quizzes").delete().eq("lesson_id", lessonId)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ message: "Quiz deleted successfully" })
  } catch (error) {
    console.error("Error deleting quiz:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
