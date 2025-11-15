import { createServerClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"

const updateQuestionSchema = z.object({
  question_text: z.string().min(5).max(1000).optional(),
  question_text_ne: z.string().optional(),
  question_type: z.enum(["multiple_choice", "true_false"]).optional(),
  order_index: z.number().min(1).optional(),
  explanation: z.string().optional(),
  explanation_ne: z.string().optional(),
})

async function verifyQuestionOwnership(questionId: string, quizId: string, userId: string, supabase: any) {
  const { data: question } = await supabase.from("quiz_questions").select("quiz_id").eq("id", questionId).single()

  if (!question || question.quiz_id !== quizId) {
    return false
  }

  const { data: quiz } = await supabase
    .from("quizzes")
    .select(
      `
      *,
      lesson:lessons(
        course_id,
        course:courses(instructor_id)
      )
    `
    )
    .eq("id", quizId)
    .single()

  if (!quiz) {
    return false
  }

  const instructorId = quiz.lesson.course.instructor_id
  if (instructorId !== userId) {
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", userId).single()
    return profile?.role === "admin"
  }

  return true
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ quizId: string; questionId: string }> }
) {
  try {
    const { quizId, questionId } = await params
    const supabase = await createServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const hasAccess = await verifyQuestionOwnership(questionId, quizId, user.id, supabase)
    if (!hasAccess) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { data: question, error } = await supabase
      .from("quiz_questions")
      .select(
        `
        *,
        options:quiz_options(*)
      `
      )
      .eq("id", questionId)
      .eq("quiz_id", quizId)
      .single()

    if (error || !question) {
      return NextResponse.json({ error: "Question not found" }, { status: 404 })
    }

    return NextResponse.json({ question })
  } catch (error) {
    console.error("Error fetching question:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ quizId: string; questionId: string }> }
) {
  try {
    const { quizId, questionId } = await params
    const supabase = await createServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const hasAccess = await verifyQuestionOwnership(questionId, quizId, user.id, supabase)
    if (!hasAccess) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await request.json()
    const validatedData = updateQuestionSchema.parse(body)

    const { data: updatedQuestion, error } = await supabase
      .from("quiz_questions")
      .update({
        ...validatedData,
      })
      .eq("id", questionId)
      .eq("quiz_id", quizId)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ question: updatedQuestion })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid input", details: error.errors }, { status: 400 })
    }
    console.error("Error updating question:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ quizId: string; questionId: string }> }
) {
  try {
    const { quizId, questionId } = await params
    const supabase = await createServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const hasAccess = await verifyQuestionOwnership(questionId, quizId, user.id, supabase)
    if (!hasAccess) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { error } = await supabase.from("quiz_questions").delete().eq("id", questionId).eq("quiz_id", quizId)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ message: "Question deleted successfully" })
  } catch (error) {
    console.error("Error deleting question:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
