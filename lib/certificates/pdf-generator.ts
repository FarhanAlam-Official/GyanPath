import jsPDF from "jspdf"
import QRCode from "qrcode"

interface CertificateData {
  userName: string
  courseName: string
  courseNameNe?: string
  certificateNumber: string
  issuedDate: string
  verificationCode: string
  verificationUrl: string
  score?: number
}

/**
 * Generate a PDF certificate with QR code
 */
export async function generateCertificatePDF(data: CertificateData): Promise<Buffer> {
  const doc = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "a4",
  })

  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()

  // Brand colors
  const primaryColor = [25, 4, 130] // #190482
  const accentColor = [119, 82, 254] // #7752FE

  // Background gradient effect (simplified)
  doc.setFillColor(194, 217, 255) // #C2D9FF
  doc.rect(0, 0, pageWidth, pageHeight, "F")

  // Decorative border
  doc.setDrawColor(...primaryColor)
  doc.setLineWidth(2)
  doc.rect(10, 10, pageWidth - 20, pageHeight - 20)

  // Inner border
  doc.setDrawColor(...accentColor)
  doc.setLineWidth(1)
  doc.rect(15, 15, pageWidth - 30, pageHeight - 30)

  // Title
  doc.setFontSize(32)
  doc.setTextColor(...primaryColor)
  doc.setFont("helvetica", "bold")
  doc.text("CERTIFICATE OF COMPLETION", pageWidth / 2, 50, { align: "center" })

  // Subtitle
  doc.setFontSize(16)
  doc.setTextColor(100, 100, 100)
  doc.setFont("helvetica", "normal")
  doc.text("This is to certify that", pageWidth / 2, 70, { align: "center" })

  // Student name
  doc.setFontSize(24)
  doc.setTextColor(...primaryColor)
  doc.setFont("helvetica", "bold")
  doc.text(data.userName, pageWidth / 2, 90, { align: "center" })

  // Course name
  doc.setFontSize(18)
  doc.setTextColor(60, 60, 60)
  doc.setFont("helvetica", "normal")
  doc.text("has successfully completed the course", pageWidth / 2, 110, { align: "center" })

  doc.setFontSize(20)
  doc.setTextColor(...primaryColor)
  doc.setFont("helvetica", "bold")
  doc.text(data.courseName, pageWidth / 2, 130, { align: "center" })

  if (data.courseNameNe) {
    doc.setFontSize(16)
    doc.setTextColor(100, 100, 100)
    doc.setFont("helvetica", "normal")
    doc.text(data.courseNameNe, pageWidth / 2, 145, { align: "center" })
  }

  // Score (if available)
  if (data.score !== undefined) {
    doc.setFontSize(14)
    doc.setTextColor(60, 60, 60)
    doc.text(`Score: ${data.score}%`, pageWidth / 2, 165, { align: "center" })
  }

  // Issue date
  doc.setFontSize(12)
  doc.setTextColor(100, 100, 100)
  doc.text(`Issued on: ${data.issuedDate}`, pageWidth / 2, 180, { align: "center" })

  // Certificate number
  doc.setFontSize(10)
  doc.setTextColor(120, 120, 120)
  doc.text(`Certificate No: ${data.certificateNumber}`, pageWidth / 2, 190, { align: "center" })

  // Generate QR code
  try {
    const qrCodeDataUrl = await QRCode.toDataURL(data.verificationUrl, {
      width: 60,
      margin: 1,
      color: {
        dark: "#190482",
        light: "#FFFFFF",
      },
    })

    // Add QR code to PDF
    doc.addImage(qrCodeDataUrl, "PNG", pageWidth - 40, pageHeight - 40, 30, 30)

    // QR code label
    doc.setFontSize(8)
    doc.setTextColor(100, 100, 100)
    doc.text("Scan to verify", pageWidth - 25, pageHeight - 45, { align: "center" })
  } catch (error) {
    console.error("Failed to generate QR code:", error)
    // Continue without QR code if generation fails
  }

  // Verification code (small text at bottom)
  doc.setFontSize(8)
  doc.setTextColor(150, 150, 150)
  doc.text(
    `Verification Code: ${data.verificationCode}`,
    pageWidth / 2,
    pageHeight - 10,
    { align: "center" }
  )

  // GyanPath branding
  doc.setFontSize(10)
  doc.setTextColor(...accentColor)
  doc.setFont("helvetica", "bold")
  doc.text("GyanPath", 20, pageHeight - 10)
  doc.setFontSize(8)
  doc.setTextColor(100, 100, 100)
  doc.setFont("helvetica", "normal")
  doc.text("Offline Learning Platform", 20, pageHeight - 5)

  // Convert to buffer
  const pdfBlob = doc.output("arraybuffer")
  return Buffer.from(pdfBlob)
}

/**
 * Generate certificate PDF as base64 string (for browser use)
 */
export async function generateCertificatePDFBase64(data: CertificateData): Promise<string> {
  const buffer = await generateCertificatePDF(data)
  return buffer.toString("base64")
}

/**
 * Generate certificate PDF as blob (for download)
 */
export async function generateCertificatePDFBlob(data: CertificateData): Promise<Blob> {
  const buffer = await generateCertificatePDF(data)
  return new Blob([buffer], { type: "application/pdf" })
}

