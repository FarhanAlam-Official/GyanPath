import { createServerClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"

const updateUserSchema = z.object({
  full_name: z.string().min(1).max(200).optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  avatar_url: z.string().url().optional(),
  preferred_language: z.string().optional(),
  is_suspended: z.boolean().optional(),
  suspended_reason: z.string().optional(),
})

async function verifyAdmin(userId: string, supabase: any) {
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", userId).single()
  return profile?.role === "admin"
}

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
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (!(await verifyAdmin(user.id, supabase))) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { data: profile, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", id)
      .single()

    if (error || !profile) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Get additional user stats
    const { count: coursesCount } = await supabase
      .from("courses")
      .select("*", { count: "exact", head: true })
      .eq("instructor_id", id)

    const { count: enrollmentsCount } = await supabase
      .from("course_enrollments")
      .select("*", { count: "exact", head: true })
      .eq("user_id", id)

    return NextResponse.json({
      user: profile,
      stats: {
        courses: coursesCount || 0,
        enrollments: enrollmentsCount || 0,
      },
    })
  } catch (error) {
    console.error("Error fetching user:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(
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
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (!(await verifyAdmin(user.id, supabase))) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await request.json()
    const validatedData = updateUserSchema.parse(body)

    // Don't allow updating email via this endpoint (should use auth admin API)
    const { email, ...updateData } = validatedData

    // Handle suspension
    if (validatedData.is_suspended !== undefined) {
      if (validatedData.is_suspended) {
        updateData.suspended_at = new Date().toISOString()
      } else {
        updateData.suspended_at = null
        updateData.suspended_reason = null
      }
    }

    const { data: updatedUser, error } = await supabase
      .from("profiles")
      .update({
        ...updateData,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ user: updatedUser })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid input", details: error.errors }, { status: 400 })
    }
    console.error("Error updating user:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(
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
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (!(await verifyAdmin(user.id, supabase))) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Prevent deleting yourself
    if (id === user.id) {
      return NextResponse.json({ error: "Cannot delete your own account" }, { status: 400 })
    }

    // Delete user (this will cascade delete profile due to ON DELETE CASCADE)
    const { error: deleteError } = await supabase.auth.admin.deleteUser(id)

    if (deleteError) {
      return NextResponse.json({ error: deleteError.message }, { status: 500 })
    }

    return NextResponse.json({ message: "User deleted successfully" })
  } catch (error) {
    console.error("Error deleting user:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

