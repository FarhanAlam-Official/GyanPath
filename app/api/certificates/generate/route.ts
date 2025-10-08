import { createServerClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const supabase = await createServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { courseId } = await request.json()

    // Check if certificate already exists
    const { data: existingCert } = await supabase
      .from("certificates")
      .select("*")
      .eq("user_id", user.id)
      .eq("course_id", courseId)
      .single()

    if (existingCert) {
      return NextResponse.json(
        {
          error: "Certificate already exists",
          certificate: existingCert,
        },
        { status: 400 },
      )
    }

    // Check course completion using the database function
    const { data: isComplete, error: completionError } = await supabase.rpc("check_course_completion", {
      p_user_id: user.id,
      p_course_id: courseId,
    })

    if (completionError || !isComplete) {
      return NextResponse.json(
        {
          error: "Course not completed. Complete all lessons and pass all quizzes.",
        },
        { status: 400 },
      )
    }

    // Calculate average score
    const { data: avgScore } = await supabase.rpc("calculate_course_score", {
      p_user_id: user.id,
      p_course_id: courseId,
    })

    // Generate unique certificate number and verification code
    const certificateNumber = `GP-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`
    const verificationCode = `${Math.random().toString(36).substr(2, 9).toUpperCase()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`

    // Create certificate
    const { data: certificate, error: certError } = await supabase
      .from("certificates")
      .insert({
        user_id: user.id,
        course_id: courseId,
        certificate_number: certificateNumber,
        verification_code: verificationCode,
        score: avgScore || 0,
      })
      .select()
      .single()

    if (certError) {
      return NextResponse.json({ error: certError.message }, { status: 500 })
    }

    return NextResponse.json({ certificate })
  } catch (error) {
    console.error("[v0] Certificate generation error:", error)
    return NextResponse.json({ error: "Failed to generate certificate" }, { status: 500 })
  }
}
