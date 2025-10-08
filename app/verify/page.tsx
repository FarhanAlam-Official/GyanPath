import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Award, CheckCircle, XCircle } from "lucide-react"

export default function VerifyPage({
  searchParams,
}: {
  searchParams: { code?: string }
}) {
  return (
    <div className="container mx-auto p-6 max-w-2xl min-h-screen flex items-center justify-center">
      <Card className="w-full">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Award className="h-16 w-16 text-[#7752FE]" />
          </div>
          <CardTitle className="text-2xl text-[#190482]">Certificate Verification</CardTitle>
        </CardHeader>
        <CardContent>
          <form action="/api/certificates/verify" method="GET" className="space-y-4">
            <div>
              <label htmlFor="code" className="block text-sm font-medium mb-2">
                Enter Verification Code
              </label>
              <Input
                id="code"
                name="code"
                placeholder="XXXXXXXXX-XXXXXXXXX"
                defaultValue={searchParams.code}
                className="font-mono"
                required
              />
            </div>
            <Button type="submit" className="w-full bg-[#7752FE] hover:bg-[#190482]">
              Verify Certificate
            </Button>
          </form>

          {searchParams.code && <VerificationResult code={searchParams.code} />}
        </CardContent>
      </Card>
    </div>
  )
}

async function VerificationResult({ code }: { code: string }) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/api/certificates/verify?code=${code}`,
      { cache: "no-store" },
    )
    const data = await response.json()

    if (data.valid) {
      return (
        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-start gap-3">
            <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-green-900 mb-2">Valid Certificate</h3>
              <div className="text-sm text-green-800 space-y-1">
                <p>
                  <strong>Recipient:</strong> {data.certificate.user_profiles?.full_name}
                </p>
                <p>
                  <strong>Course:</strong> {data.certificate.courses?.title}
                </p>
                <p>
                  <strong>Score:</strong> {data.certificate.score?.toFixed(1)}%
                </p>
                <p>
                  <strong>Issued:</strong> {new Date(data.certificate.issued_at).toLocaleDateString()}
                </p>
                <p>
                  <strong>Certificate #:</strong> {data.certificate.certificate_number}
                </p>
              </div>
            </div>
          </div>
        </div>
      )
    }
  } catch (error) {
    // Error will be shown below
  }

  return (
    <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
      <div className="flex items-start gap-3">
        <XCircle className="h-6 w-6 text-red-600 flex-shrink-0 mt-0.5" />
        <div>
          <h3 className="font-semibold text-red-900 mb-1">Invalid Certificate</h3>
          <p className="text-sm text-red-800">This verification code does not match any certificate in our system.</p>
        </div>
      </div>
    </div>
  )
}
