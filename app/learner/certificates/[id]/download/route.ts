import { createServerClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { jsPDF } from "jspdf"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const supabase = await createServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get certificate details
    const { data: certificate, error } = await supabase
      .from("certificates")
      .select(`
        *,
        user_profiles!certificates_user_id_fkey(full_name, email),
        courses(title, title_ne)
      `)
      .eq("id", params.id)
      .eq("user_id", user.id)
      .single()

    if (error || !certificate) {
      return NextResponse.json({ error: "Certificate not found" }, { status: 404 })
    }

    // Create PDF
    const doc = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: "a4",
    })

    const pageWidth = doc.internal.pageSize.getWidth()
    const pageHeight = doc.internal.pageSize.getHeight()

    // Border
    doc.setDrawColor(119, 82, 254) // #7752FE
    doc.setLineWidth(3)
    doc.rect(10, 10, pageWidth - 20, pageHeight - 20)

    // Title
    doc.setFontSize(32)
    doc.setTextColor(25, 4, 130) // #190482
    doc.text("Certificate of Completion", pageWidth / 2, 40, { align: "center" })

    // Decorative line
    doc.setDrawColor(119, 82, 254)
    doc.setLineWidth(0.5)
    doc.line(pageWidth / 2 - 20, 45, pageWidth / 2 + 20, 45)

    // Body text
    doc.setFontSize(14)
    doc.setTextColor(100, 100, 100)
    doc.text("This is to certify that", pageWidth / 2, 65, { align: "center" })

    // Recipient name
    doc.setFontSize(24)
    doc.setTextColor(25, 4, 130)
    doc.text(certificate.user_profiles?.full_name || "Unknown", pageWidth / 2, 80, { align: "center" })

    // Course completion text
    doc.setFontSize(14)
    doc.setTextColor(100, 100, 100)
    doc.text("has successfully completed", pageWidth / 2, 95, { align: "center" })

    // Course name
    doc.setFontSize(20)
    doc.setTextColor(119, 82, 254)
    doc.text(certificate.courses?.title || "Unknown Course", pageWidth / 2, 110, { align: "center" })

    // Score
    doc.setFontSize(14)
    doc.setTextColor(100, 100, 100)
    doc.text(`with a score of ${certificate.score?.toFixed(1)}%`, pageWidth / 2, 125, { align: "center" })

    // Date and certificate number
    doc.setFontSize(10)
    doc.setTextColor(100, 100, 100)
    const issueDate = new Date(certificate.issued_at).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
    doc.text(`Issue Date: ${issueDate}`, 30, pageHeight - 30)
    doc.text(`Certificate No: ${certificate.certificate_number}`, pageWidth - 30, pageHeight - 30, { align: "right" })

    // Verification code
    doc.setFontSize(8)
    doc.text(`Verification Code: ${certificate.verification_code}`, pageWidth / 2, pageHeight - 20, { align: "center" })

    // Generate PDF buffer
    const pdfBuffer = doc.output("arraybuffer")

    // Return PDF
    return new NextResponse(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="certificate-${certificate.certificate_number}.pdf"`,
      },
    })
  } catch (error) {
    console.error("[v0] PDF generation error:", error)
    return NextResponse.json({ error: "Failed to generate PDF" }, { status: 500 })
  }
}
