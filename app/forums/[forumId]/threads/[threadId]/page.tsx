import { redirect, notFound } from "next/navigation"
import { createServerClient } from "@/lib/supabase/server"
import { DashboardLayout } from "@/components/dashboard-layout"
import { ForumThreadView } from "@/components/forum-thread-view"

export default async function ForumThreadPage({
  params,
}: {
  params: Promise<{ forumId: string; threadId: string }>
}) {
  const { forumId, threadId } = await params
  const supabase = await createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  if (!profile) {
    redirect("/auth/login")
  }

  // Get thread
  const { data: threads } = await supabase
    .from("forum_threads")
    .select(
      `
      *,
      author:profiles!forum_threads_author_id_fkey(id, full_name, email, avatar_url)
    `
    )
    .eq("id", threadId)
    .eq("forum_id", forumId)
    .single()

  if (!threads) {
    notFound()
  }

  // Get replies
  const { data: replies } = await supabase
    .from("forum_replies")
    .select(
      `
      *,
      author:profiles!forum_replies_author_id_fkey(id, full_name, email, avatar_url)
    `
    )
    .eq("thread_id", threadId)
    .order("created_at", { ascending: true })

  return (
    <DashboardLayout role={profile.role} userName={profile.full_name}>
      <ForumThreadView thread={threads} replies={replies || []} currentUserId={user.id} />
    </DashboardLayout>
  )
}

