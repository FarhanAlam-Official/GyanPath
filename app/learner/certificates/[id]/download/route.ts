import { createServerClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"
import { generateCertificatePDF } from "@/lib/certificates/pdf-generator"
import { ApiError } from "@/lib/utils/api-error"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      throw new ApiError("Unauthorized", 401)
    }

    // Get certificate details
    const { data: certificate, error } = await supabase
      .from("certificates")
      .select(
        `
        *,
        user:profiles!certificates_user_id_fkey(full_name),
        course:courses!certificates_course_id_fkey(title, title_ne)
      `
      )
      .eq("id", id)
      .eq("user_id", user.id)
      .single()

    if (error || !certificate) {
      throw new ApiError("Certificate not found", 404)
    }

    // Get verification URL
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
    const verificationUrl = `${siteUrl}/verify?code=${certificate.verification_code}`

    // Format date
    const issuedDate = new Date(certificate.issued_at).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })

    // Generate PDF using our generator
    const pdfBuffer = await generateCertificatePDF({
      userName: (certificate.user as { full_name: string }).full_name,
      courseName: (certificate.course as { title: string }).title,
      courseNameNe: (certificate.course as { title_ne?: string }).title_ne,
      certificateNumber: certificate.certificate_number,
      issuedDate,
      verificationCode: certificate.verification_code,
      verificationUrl,
      score: certificate.score ? Number(certificate.score) : undefined,
    })

    // Return PDF
    return new NextResponse(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="certificate-${certificate.certificate_number}.pdf"`,
      },
    })
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode })
    }

    console.error("PDF generation error:", error)
    return NextResponse.json({ error: "Failed to generate PDF" }, { status: 500 })
  }
}
