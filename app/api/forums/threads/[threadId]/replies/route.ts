import { createServerClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"

const createReplySchema = z.object({
  content: z.string().min(1),
  is_solution: z.boolean().optional(),
})

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ threadId: string }> }
) {
  try {
    const { threadId } = await params
    const supabase = await createServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: replies, error } = await supabase
      .from("forum_replies")
      .select(
        `
        *,
        author:profiles!forum_replies_author_id_fkey(id, full_name, email, avatar_url)
      `
      )
      .eq("thread_id", threadId)
      .order("created_at", { ascending: true })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ replies: replies || [] })
  } catch (error) {
    console.error("Error fetching replies:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ threadId: string }> }
) {
  try {
    const { threadId } = await params
    const supabase = await createServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = createReplySchema.parse(body)

    // Create reply
    const { data: reply, error: replyError } = await supabase
      .from("forum_replies")
      .insert({
        thread_id: threadId,
        author_id: user.id,
        content: validatedData.content,
        is_solution: validatedData.is_solution || false,
      })
      .select(
        `
        *,
        author:profiles!forum_replies_author_id_fkey(id, full_name, email, avatar_url)
      `
      )
      .single()

    if (replyError) {
      return NextResponse.json({ error: replyError.message }, { status: 500 })
    }

    // Get current thread to update counts
    const { data: thread } = await supabase
      .from("forum_threads")
      .select("reply_count, view_count")
      .eq("id", threadId)
      .single()

    // Update thread reply count and last_reply_at
    await supabase
      .from("forum_threads")
      .update({
        reply_count: (thread?.reply_count || 0) + 1,
        last_reply_at: new Date().toISOString(),
      })
      .eq("id", threadId)

    return NextResponse.json({ reply }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid input", details: error.errors }, { status: 400 })
    }
    console.error("Error creating reply:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

