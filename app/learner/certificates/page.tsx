import { createServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Award, Download, ExternalLink } from "lucide-react"
import Link from "next/link"

export default async function CertificatesPage() {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: certificates, error } = await supabase
    .from("certificates")
    .select(`
      *,
      courses(title, title_ne, thumbnail_url)
    `)
    .eq("user_id", user.id)
    .order("issued_at", { ascending: false })

  // Handle case where table doesn't exist yet
  if (error && error.code === "PGRST205") {
    return (
      <div className="container mx-auto p-6 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#190482] mb-2">My Certificates</h1>
          <p className="text-gray-600">View and download your earned certificates</p>
        </div>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Award className="h-16 w-16 text-gray-300 mb-4" />
            <p className="text-gray-500 text-center mb-4">
              The certificates feature is not yet set up. Please run the database migration script.
            </p>
            <p className="text-sm text-gray-400 text-center">
              Run script: <code className="bg-gray-100 px-2 py-1 rounded">004_create_certificates_schema.sql</code>
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#190482] mb-2">My Certificates</h1>
        <p className="text-gray-600">View and download your earned certificates</p>
      </div>

      {!certificates || certificates.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Award className="h-16 w-16 text-gray-300 mb-4" />
            <p className="text-gray-500 text-center mb-4">You haven't earned any certificates yet.</p>
            <Link href="/learner/browse">
              <Button className="bg-[#7752FE] hover:bg-[#190482]">Browse Courses</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {certificates.map((cert: any) => (
            <Card key={cert.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <Award className="h-8 w-8 text-[#7752FE]" />
                  <span className="text-xs text-gray-500">{new Date(cert.issued_at).toLocaleDateString()}</span>
                </div>
                <CardTitle className="text-lg mt-2">{cert.courses?.title || "Course Certificate"}</CardTitle>
                <CardDescription>Certificate #{cert.certificate_number}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Score:</span>
                    <span className="font-semibold text-[#190482]">{cert.score?.toFixed(1)}%</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Link href={`/learner/certificates/${cert.id}`} className="flex-1">
                    <Button variant="outline" className="w-full bg-transparent" size="sm">
                      <ExternalLink className="mr-2 h-4 w-4" />
                      View
                    </Button>
                  </Link>
                  <Link href={`/learner/certificates/${cert.id}/download`} className="flex-1">
                    <Button className="w-full bg-[#7752FE] hover:bg-[#190482]" size="sm">
                      <Download className="mr-2 h-4 w-4" />
                      Download
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
