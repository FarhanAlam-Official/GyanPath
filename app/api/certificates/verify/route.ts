import { createServerClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const verificationCode = searchParams.get("code")

    if (!verificationCode) {
      return NextResponse.json({ error: "Verification code required" }, { status: 400 })
    }

    const supabase = await createServerClient()

    // Get certificate with user and course details
    const { data: certificate, error } = await supabase
      .from("certificates")
      .select(`
        *,
        user_profiles!certificates_user_id_fkey(full_name, email),
        courses(title, title_ne, instructor_id)
      `)
      .eq("verification_code", verificationCode)
      .single()

    if (error || !certificate) {
      return NextResponse.json(
        {
          valid: false,
          error: "Invalid verification code",
        },
        { status: 404 },
      )
    }

    return NextResponse.json({
      valid: true,
      certificate,
    })
  } catch (error) {
    console.error("[v0] Certificate verification error:", error)
    return NextResponse.json({ error: "Verification failed" }, { status: 500 })
  }
}
