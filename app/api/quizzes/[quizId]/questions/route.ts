import { createServerClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"

const createQuestionSchema = z.object({
  question_text: z.string().min(5).max(1000),
  question_text_ne: z.string().optional(),
  question_type: z.enum(["multiple_choice", "true_false"]).default("multiple_choice"),
  order_index: z.number().min(1).optional(),
  explanation: z.string().optional(),
  explanation_ne: z.string().optional(),
  options: z.array(
    z.object({
      option_text: z.string().min(1).max(500),
      option_text_ne: z.string().optional(),
      is_correct: z.boolean(),
      order_index: z.number().min(1),
    })
  ),
})

async function verifyQuizOwnership(quizId: string, userId: string, supabase: any) {
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

export async function GET(request: NextRequest, { params }: { params: Promise<{ quizId: string }> }) {
  try {
    const { quizId } = await params
    const supabase = await createServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const hasAccess = await verifyQuizOwnership(quizId, user.id, supabase)
    if (!hasAccess) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { data: questions, error } = await supabase
      .from("quiz_questions")
      .select(
        `
        *,
        options:quiz_options(*)
      `
      )
      .eq("quiz_id", quizId)
      .order("order_index", { ascending: true })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ questions })
  } catch (error) {
    console.error("Error fetching questions:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ quizId: string }> }) {
  try {
    const { quizId } = await params
    const supabase = await createServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const hasAccess = await verifyQuizOwnership(quizId, user.id, supabase)
    if (!hasAccess) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await request.json()
    const validatedData = createQuestionSchema.parse(body)

    // Get next order index if not provided
    let orderIndex = validatedData.order_index
    if (!orderIndex) {
      const { count } = await supabase
        .from("quiz_questions")
        .select("*", { count: "exact", head: true })
        .eq("quiz_id", quizId)
      orderIndex = (count || 0) + 1
    }

    // Validate that at least one option is correct
    const correctOptions = validatedData.options.filter((opt) => opt.is_correct)
    if (correctOptions.length === 0) {
      return NextResponse.json({ error: "At least one option must be marked as correct" }, { status: 400 })
    }

    // Create question
    const { data: question, error: questionError } = await supabase
      .from("quiz_questions")
      .insert({
        quiz_id: quizId,
        question_text: validatedData.question_text,
        question_text_ne: validatedData.question_text_ne || null,
        question_type: validatedData.question_type,
        order_index: orderIndex,
        explanation: validatedData.explanation || null,
        explanation_ne: validatedData.explanation_ne || null,
      })
      .select()
      .single()

    if (questionError) {
      return NextResponse.json({ error: questionError.message }, { status: 500 })
    }

    // Create options
    const optionsWithQuestionId = validatedData.options.map((opt) => ({
      ...opt,
      question_id: question.id,
    }))

    const { data: options, error: optionsError } = await supabase
      .from("quiz_options")
      .insert(optionsWithQuestionId)
      .select()

    if (optionsError) {
      return NextResponse.json({ error: optionsError.message }, { status: 500 })
    }

    return NextResponse.json({ question: { ...question, options } }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid input", details: error.errors }, { status: 400 })
    }
    console.error("Error creating question:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
