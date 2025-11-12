import { createServerClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"

const bulkAddSchema = z.object({
  user_ids: z.array(z.string().uuid()).min(1).max(100),
})

async function verifyGroupAdmin(groupId: string, userId: string, supabase: any) {
  const { data: group } = await supabase
    .from("groups")
    .select("group_admin_id")
    .eq("id", groupId)
    .single()

  if (!group) {
    return false
  }

  if (group.group_admin_id === userId) {
    return true
  }

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", userId).single()
  return profile?.role === "admin"
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ groupId: string }> }
) {
  try {
    const { groupId } = await params
    const supabase = await createServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (!(await verifyGroupAdmin(groupId, user.id, supabase))) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await request.json()
    const validatedData = bulkAddSchema.parse(body)

    // Verify all users exist
    const { data: users, error: usersError } = await supabase
      .from("profiles")
      .select("id")
      .in("id", validatedData.user_ids)

    if (usersError || !users || users.length !== validatedData.user_ids.length) {
      return NextResponse.json({ error: "One or more users not found" }, { status: 400 })
    }

    // Check existing members
    const { data: existingMembers } = await supabase
      .from("group_members")
      .select("user_id")
      .eq("group_id", groupId)
      .in("user_id", validatedData.user_ids)

    const existingUserIds = new Set(existingMembers?.map((m) => m.user_id) || [])
    const newUserIds = validatedData.user_ids.filter((id) => !existingUserIds.has(id))

    if (newUserIds.length === 0) {
      return NextResponse.json({ error: "All users are already members" }, { status: 400 })
    }

    // Bulk insert new members
    const membersToInsert = newUserIds.map((user_id) => ({
      group_id: groupId,
      user_id,
    }))

    const { data: newMembers, error: insertError } = await supabase
      .from("group_members")
      .insert(membersToInsert)
      .select()

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 })
    }

    return NextResponse.json({
      added: newMembers?.length || 0,
      skipped: existingUserIds.size,
      members: newMembers,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid input", details: error.errors }, { status: 400 })
    }
    console.error("Error bulk adding members:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

