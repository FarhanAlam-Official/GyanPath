import { createServerClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"

const updateStatusSchema = z.object({
  status: z.enum(["draft", "pending", "approved", "rejected", "published"]),
  rejection_reason: z.string().optional(),
})

async function verifyAdmin(userId: string, supabase: any) {
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", userId).single()
  return profile?.role === "admin"
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
    const validatedData = updateStatusSchema.parse(body)

    const updateData: any = {
      updated_at: new Date().toISOString(),
    }

    // If status column exists, update it
    // Otherwise, use is_published for published status
    if (validatedData.status === "published") {
      updateData.is_published = true
    } else if (validatedData.status === "rejected") {
      updateData.is_published = false
      // Store rejection reason if provided
      if (validatedData.rejection_reason) {
        // You might want to add a rejection_reason column to courses table
      }
    }

    const { data: updatedCourse, error } = await supabase
      .from("courses")
      .update(updateData)
      .eq("id", id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ course: updatedCourse })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid input", details: error.errors }, { status: 400 })
    }
    console.error("Error updating course status:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

