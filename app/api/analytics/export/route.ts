import { createServerClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

    if (!profile || profile.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const searchParams = request.nextUrl.searchParams
    const format = searchParams.get("format") || "csv"
    const type = searchParams.get("type") || "users"

    let data: any[] = []
    let filename = ""

    switch (type) {
      case "users":
        const { data: users } = await supabase
          .from("profiles")
          .select("id, email, full_name, role, created_at")
          .order("created_at", { ascending: false })

        data = users || []
        filename = "users"
        break

      case "courses":
        const { data: courses } = await supabase
          .from("courses")
          .select("id, title, instructor_id, is_published, created_at")
          .order("created_at", { ascending: false })

        data = courses || []
        filename = "courses"
        break

      case "enrollments":
        const { data: enrollments } = await supabase
          .from("course_enrollments")
          .select("id, user_id, course_id, progress_percentage, completed, created_at")
          .order("created_at", { ascending: false })

        data = enrollments || []
        filename = "enrollments"
        break

      default:
        return NextResponse.json({ error: "Invalid export type" }, { status: 400 })
    }

    if (format === "csv") {
      // Convert to CSV
      if (data.length === 0) {
        return NextResponse.json({ error: "No data to export" }, { status: 400 })
      }

      const headers = Object.keys(data[0])
      const csvRows = [
        headers.join(","),
        ...data.map((row) => headers.map((header) => JSON.stringify(row[header] || "")).join(",")),
      ]

      const csv = csvRows.join("\n")

      return new NextResponse(csv, {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="${filename}-${new Date().toISOString().split("T")[0]}.csv"`,
        },
      })
    } else if (format === "json") {
      return NextResponse.json({ data, exportedAt: new Date().toISOString() })
    }

    return NextResponse.json({ error: "Invalid format" }, { status: 400 })
  } catch (error) {
    console.error("Error exporting data:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

