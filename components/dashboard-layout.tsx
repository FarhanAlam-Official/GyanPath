"use client"

import type React from "react"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { BookOpen, Home, LogOut, Settings, Users, Video, FileText, BarChart } from "lucide-react"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import type { UserRole } from "@/lib/types"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"

interface DashboardLayoutProps {
  children: React.ReactNode
  role: UserRole
  userName: string
}

export function DashboardLayout({ children, role, userName }: DashboardLayoutProps) {
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    
    // Clear session preference cookie and session preference
    if (typeof window !== "undefined") {
      document.cookie = `sb-session-preference=; path=/; max-age=0; SameSite=Lax`
      localStorage.removeItem("rememberMe")
      localStorage.removeItem("rememberedEmail")
      // Clear session preference
      const { clearSessionPreference } = await import("@/lib/auth/session")
      clearSessionPreference()
    }
    router.push("/auth/login")
  }

  const getNavItems = () => {
    const baseItems = [
      { href: `/${role}`, icon: Home, label: "Dashboard" },
      { href: `/${role}/profile`, icon: Settings, label: "Profile" },
    ]

    if (role === "admin") {
      return [
        ...baseItems,
        { href: "/admin/users", icon: Users, label: "Users" },
        { href: "/admin/courses", icon: BookOpen, label: "Courses" },
        { href: "/admin/groups", icon: Users, label: "Groups" },
        { href: "/admin/analytics", icon: BarChart, label: "Analytics" },
      ]
    }

    if (role === "group_admin") {
      return [
        ...baseItems,
        { href: "/group-admin/groups", icon: Users, label: "My Groups" },
        { href: "/group-admin/members", icon: Users, label: "Members" },
        { href: "/group-admin/reports", icon: BarChart, label: "Reports" },
      ]
    }

    if (role === "instructor") {
      return [
        ...baseItems,
        { href: "/instructor/courses", icon: BookOpen, label: "My Courses" },
        { href: "/instructor/lessons", icon: Video, label: "Lessons" },
        { href: "/instructor/quizzes", icon: FileText, label: "Quizzes" },
        { href: "/instructor/students", icon: Users, label: "Students" },
      ]
    }

    // learner
    return [
      ...baseItems,
      { href: "/learner/courses", icon: BookOpen, label: "My Courses" },
      { href: "/learner/browse", icon: BookOpen, label: "Browse Courses" },
      { href: "/learner/certificates", icon: FileText, label: "Certificates" },
    ]
  }

  const navItems = getNavItems()

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <div className="flex flex-1 bg-gray-50">
        {/* Sidebar */}
        <aside className="w-64 bg-[#190482] text-white flex flex-col">
          <div className="p-6 border-b border-white/10">
            <h1 className="text-2xl font-bold">GyanPath</h1>
            <p className="text-sm text-white/70 mt-1 capitalize">{role.replace("_", " ")}</p>
          </div>

          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive ? "bg-[#7752FE] text-white" : "text-white/70 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </Link>
              )
            })}
          </nav>

          <div className="p-4 border-t border-white/10">
            <div className="mb-4 px-4">
              <p className="text-sm text-white/70">Signed in as</p>
              <p className="text-sm font-medium truncate">{userName}</p>
            </div>
            <Button
              onClick={handleSignOut}
              variant="outline"
              className="w-full bg-white/10 text-white border-white/20 hover:bg-white/20"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          <div className="container mx-auto p-8">{children}</div>
        </main>
      </div>
      <SiteFooter />
    </div>
  )
}
