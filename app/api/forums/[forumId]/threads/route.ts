import { createServerClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"

const createThreadSchema = z.object({
  title: z.string().min(1),
  content: z.string().min(1),
  is_pinned: z.boolean().optional(),
})

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ forumId: string }> }
) {
  try {
    const { forumId } = await params
    const supabase = await createServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: threads, error } = await supabase
      .from("forum_threads")
      .select(
        `
        *,
        author:profiles!forum_threads_author_id_fkey(id, full_name, email, avatar_url)
      `
      )
      .eq("forum_id", forumId)
      .order("is_pinned", { ascending: false })
      .order("last_reply_at", { ascending: false, nullsFirst: false })
      .order("created_at", { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ threads: threads || [] })
  } catch (error) {
    console.error("Error fetching threads:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ forumId: string }> }
) {
  try {
    const { forumId } = await params
    const supabase = await createServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = createThreadSchema.parse(body)

    const { data: thread, error } = await supabase
      .from("forum_threads")
      .insert({
        forum_id: forumId,
        author_id: user.id,
        title: validatedData.title,
        content: validatedData.content,
        is_pinned: validatedData.is_pinned || false,
      })
      .select(
        `
        *,
        author:profiles!forum_threads_author_id_fkey(id, full_name, email, avatar_url)
      `
      )
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ thread }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid input", details: error.errors }, { status: 400 })
    }
    console.error("Error creating thread:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

