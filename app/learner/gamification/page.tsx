import { redirect } from "next/navigation"
import { createServerClient } from "@/lib/supabase/server"
import { DashboardLayout } from "@/components/dashboard-layout"
import { BadgeDisplay } from "@/components/badge-display"
import { PointsDisplay } from "@/components/points-display"
import { Leaderboard } from "@/components/leaderboard"

export default async function GamificationPage() {
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
          <h1 className="text-3xl font-bold text-[#190482]">Gamification</h1>
          <p className="text-muted-foreground mt-2">Track your achievements, points, and compete on leaderboards</p>
        </div>

        <PointsDisplay userId={user.id} />

        <div className="grid md:grid-cols-2 gap-6">
          <BadgeDisplay userId={user.id} />
          <Leaderboard type="global" limit={20} />
        </div>
      </div>
    </DashboardLayout>
  )
}

