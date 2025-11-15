import { redirect } from "next/navigation"
import { createServerClient } from "@/lib/supabase/server"
import { DashboardLayout } from "@/components/dashboard-layout"
import { MessageInbox } from "@/components/message-inbox"

export default async function MessagesPage() {
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

  return (
    <DashboardLayout role={profile.role} userName={profile.full_name}>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-[#190482]">Messages</h1>
          <p className="text-muted-foreground mt-2">Send and receive messages with instructors and learners</p>
        </div>

        <MessageInbox currentUserId={user.id} />
      </div>
    </DashboardLayout>
  )
}

