import { createServerClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"

const createAnnouncementSchema = z.object({
  group_id: z.string().uuid().optional(),
  course_id: z.string().uuid().optional(),
  title: z.string().min(1),
  content: z.string().min(1),
  is_pinned: z.boolean().optional(),
})

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const groupId = searchParams.get("group_id")
    const courseId = searchParams.get("course_id")

    let query = supabase
      .from("announcements")
      .select(
        `
        *,
        author:profiles!announcements_author_id_fkey(id, full_name, email, avatar_url)
      `
      )
      .order("is_pinned", { ascending: false })
      .order("created_at", { ascending: false })

    if (groupId) {
      query = query.eq("group_id", groupId)
    }

    if (courseId) {
      query = query.eq("course_id", courseId)
    }

    const { data: announcements, error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ announcements: announcements || [] })
  } catch (error) {
    console.error("Error fetching announcements:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user is instructor, admin, or group admin
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

    if (!profile || !["instructor", "admin", "group_admin"].includes(profile.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await request.json()
    const validatedData = createAnnouncementSchema.parse(body)

    // Verify group admin owns the group if group_id is provided
    if (validatedData.group_id && profile.role === "group_admin") {
      const { data: group } = await supabase
        .from("groups")
        .select("group_admin_id")
        .eq("id", validatedData.group_id)
        .single()

      if (!group || group.group_admin_id !== user.id) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 })
      }
    }

    // Verify instructor owns the course if course_id is provided
    if (validatedData.course_id && profile.role === "instructor") {
      const { data: course } = await supabase
        .from("courses")
        .select("instructor_id")
        .eq("id", validatedData.course_id)
        .single()

      if (!course || course.instructor_id !== user.id) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 })
      }
    }

    const { data: announcement, error } = await supabase
      .from("announcements")
      .insert({
        author_id: user.id,
        group_id: validatedData.group_id || null,
        course_id: validatedData.course_id || null,
        title: validatedData.title,
        content: validatedData.content,
        is_pinned: validatedData.is_pinned || false,
      })
      .select(
        `
        *,
        author:profiles!announcements_author_id_fkey(id, full_name, email, avatar_url)
      `
      )
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Create notifications for relevant users
    if (validatedData.group_id) {
      // Notify group members
      const { data: members } = await supabase
        .from("group_members")
        .select("user_id")
        .eq("group_id", validatedData.group_id)

      if (members) {
        const notifications = members.map((m) => ({
          user_id: m.user_id,
          type: "announcement" as const,
          title: "New Group Announcement",
          message: validatedData.title,
          link: `/group-admin/groups/${validatedData.group_id}`,
        }))

        await supabase.from("notifications").insert(notifications)
      }
    } else if (validatedData.course_id) {
      // Notify course enrollees
      const { data: enrollments } = await supabase
        .from("course_enrollments")
        .select("user_id")
        .eq("course_id", validatedData.course_id)

      if (enrollments) {
        const notifications = enrollments.map((e) => ({
          user_id: e.user_id,
          type: "announcement" as const,
          title: "New Course Announcement",
          message: validatedData.title,
          link: `/learner/courses/${validatedData.course_id}`,
        }))

        await supabase.from("notifications").insert(notifications)
      }
    }

    return NextResponse.json({ announcement }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid input", details: error.errors }, { status: 400 })
    }
    console.error("Error creating announcement:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

