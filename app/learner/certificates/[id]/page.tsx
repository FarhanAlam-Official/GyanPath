import { createServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download, Award, CheckCircle } from "lucide-react"
import Link from "next/link"
import { QRCodeSVG } from "qrcode.react"

export default async function CertificateViewPage({
  params,
}: {
  params: { id: string }
}) {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: certificate } = await supabase
    .from("certificates")
    .select(`
      *,
      user_profiles!certificates_user_id_fkey(full_name, email),
      courses(title, title_ne, description, instructor_id)
    `)
    .eq("id", params.id)
    .eq("user_id", user.id)
    .single()

  if (!certificate) {
    redirect("/learner/certificates")
  }

  const verificationUrl = `${process.env.NEXT_PUBLIC_SITE_URL || "https://gyanpath.vercel.app"}/verify?code=${certificate.verification_code}`

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6 flex items-center justify-between">
        <Link href="/learner/certificates">
          <Button variant="outline">← Back to Certificates</Button>
        </Link>
        <Link href={`/learner/certificates/${params.id}/download`}>
          <Button className="bg-[#7752FE] hover:bg-[#190482]">
            <Download className="mr-2 h-4 w-4" />
            Download PDF
          </Button>
        </Link>
      </div>

      <Card className="border-4 border-[#7752FE]">
        <CardContent className="p-12">
          <div className="text-center space-y-6">
            {/* Header */}
            <div className="flex justify-center">
              <Award className="h-20 w-20 text-[#7752FE]" />
            </div>

            {/* Title */}
            <div>
              <h1 className="text-4xl font-bold text-[#190482] mb-2">Certificate of Completion</h1>
              <div className="h-1 w-32 bg-[#7752FE] mx-auto" />
            </div>

            {/* Recipient */}
            <div className="py-6">
              <p className="text-gray-600 mb-2">This is to certify that</p>
              <h2 className="text-3xl font-bold text-[#190482]">{certificate.user_profiles?.full_name}</h2>
            </div>

            {/* Course */}
            <div className="py-4">
              <p className="text-gray-600 mb-2">has successfully completed</p>
              <h3 className="text-2xl font-semibold text-[#7752FE]">{certificate.courses?.title}</h3>
            </div>

            {/* Score */}
            <div className="flex items-center justify-center gap-2 py-4">
              <CheckCircle className="h-6 w-6 text-green-600" />
              <p className="text-lg">
                with a score of <span className="font-bold text-[#190482]">{certificate.score?.toFixed(1)}%</span>
              </p>
            </div>

            {/* Date and Certificate Number */}
            <div className="pt-6 border-t border-gray-200">
              <div className="flex justify-between items-start text-sm text-gray-600">
                <div className="text-left">
                  <p className="font-semibold">Issue Date</p>
                  <p>
                    {new Date(certificate.issued_at).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
                <div className="text-center">
                  <p className="font-semibold mb-2">Verify Certificate</p>
                  <QRCodeSVG value={verificationUrl} size={80} level="H" includeMargin />
                </div>
                <div className="text-right">
                  <p className="font-semibold">Certificate No.</p>
                  <p className="font-mono text-xs">{certificate.certificate_number}</p>
                </div>
              </div>
            </div>

            {/* Verification Code */}
            <div className="pt-4">
              <p className="text-xs text-gray-500">
                Verification Code: <span className="font-mono">{certificate.verification_code}</span>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Verification Instructions */}
      <Card className="mt-6">
        <CardContent className="p-6">
          <h3 className="font-semibold text-[#190482] mb-2">Certificate Verification</h3>
          <p className="text-sm text-gray-600 mb-4">
            This certificate can be verified by scanning the QR code or visiting the verification page with the code
            above.
          </p>
          <Link href={`/verify?code=${certificate.verification_code}`} target="_blank">
            <Button variant="outline" size="sm">
              Verify This Certificate
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}
