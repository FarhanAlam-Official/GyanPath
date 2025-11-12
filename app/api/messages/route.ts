import { createServerClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"

const createMessageSchema = z.object({
  recipient_id: z.string().uuid(),
  subject: z.string().optional(),
  content: z.string().min(1),
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
    const conversationWith = searchParams.get("conversation_with")

    let query = supabase
      .from("messages")
      .select(
        `
        *,
        sender:profiles!messages_sender_id_fkey(id, full_name, email, avatar_url),
        recipient:profiles!messages_recipient_id_fkey(id, full_name, email, avatar_url)
      `
      )
      .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
      .order("created_at", { ascending: false })

    if (conversationWith) {
      query = query.or(`and(sender_id.eq.${user.id},recipient_id.eq.${conversationWith}),and(sender_id.eq.${conversationWith},recipient_id.eq.${user.id})`)
    }

    const { data: messages, error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ messages: messages || [] })
  } catch (error) {
    console.error("Error fetching messages:", error)
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

    const body = await request.json()
    const validatedData = createMessageSchema.parse(body)

    // Create message
    const { data: message, error: messageError } = await supabase
      .from("messages")
      .insert({
        sender_id: user.id,
        recipient_id: validatedData.recipient_id,
        subject: validatedData.subject || null,
        content: validatedData.content,
      })
      .select(
        `
        *,
        sender:profiles!messages_sender_id_fkey(id, full_name, email, avatar_url),
        recipient:profiles!messages_recipient_id_fkey(id, full_name, email, avatar_url)
      `
      )
      .single()

    if (messageError) {
      return NextResponse.json({ error: messageError.message }, { status: 500 })
    }

    // Create notification for recipient
    await supabase.from("notifications").insert({
      user_id: validatedData.recipient_id,
      type: "message",
      title: "New Message",
      message: `You have a new message from ${message.sender?.full_name || "someone"}`,
      link: `/messages?conversation_with=${user.id}`,
    })

    return NextResponse.json({ message }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid input", details: error.errors }, { status: 400 })
    }
    console.error("Error creating message:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

