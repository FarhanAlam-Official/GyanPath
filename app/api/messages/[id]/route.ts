import { createServerClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"

const updateMessageSchema = z.object({
  is_read: z.boolean().optional(),
})

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

    const body = await request.json()
    const validatedData = updateMessageSchema.parse(body)

    // Verify message belongs to user
    const { data: message, error: fetchError } = await supabase
      .from("messages")
      .select("recipient_id")
      .eq("id", id)
      .single()

    if (fetchError || !message) {
      return NextResponse.json({ error: "Message not found" }, { status: 404 })
    }

    if (message.recipient_id !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const updateData: any = {}
    if (validatedData.is_read !== undefined) {
      updateData.is_read = validatedData.is_read
      if (validatedData.is_read) {
        updateData.read_at = new Date().toISOString()
      }
    }

    const { data: updatedMessage, error } = await supabase
      .from("messages")
      .update(updateData)
      .eq("id", id)
      .select(
        `
        *,
        sender:profiles!messages_sender_id_fkey(id, full_name, email, avatar_url),
        recipient:profiles!messages_recipient_id_fkey(id, full_name, email, avatar_url)
      `
      )
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ message: updatedMessage })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid input", details: error.errors }, { status: 400 })
    }
    console.error("Error updating message:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

