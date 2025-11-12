import { createServerClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"

const changeRoleSchema = z.object({
  role: z.enum(["admin", "group_admin", "instructor", "learner"]),
})

async function verifyAdmin(userId: string, supabase: any) {
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", userId).single()
  return profile?.role === "admin"
}

export async function POST(
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

    // Prevent changing your own role
    if (id === user.id) {
      return NextResponse.json({ error: "Cannot change your own role" }, { status: 400 })
    }

    const body = await request.json()
    const validatedData = changeRoleSchema.parse(body)

    const { data: updatedUser, error } = await supabase
      .from("profiles")
      .update({
        role: validatedData.role,
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
    console.error("Error changing user role:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

