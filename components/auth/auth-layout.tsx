"use client"

import type React from "react"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"

/**
 * AuthLayout Component
 * 
 * Reusable layout wrapper for all authentication pages that includes:
 * - Site header (navbar) with navigation
 * - Site footer with links and information
 * - Responsive background with subtle animations
 * - Consistent spacing and styling
 * 
 * @param children - The page content to render within the layout
 * @param className - Additional CSS classes for custom styling
 */
interface AuthLayoutProps {
  children: React.ReactNode
  className?: string
}

export function AuthLayout({ children, className = "" }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Site Header/Navbar */}
      <SiteHeader />

      {/* Main Content Area with Animated Background */}
      <main className="flex-1 relative overflow-hidden">
        {/* Animated gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#190482] via-[#7752FE] to-[#8E8FFA] opacity-5 dark:opacity-10" />
        
        {/* Subtle pattern overlay */}
        <div 
          className="absolute inset-0 opacity-[0.02] dark:opacity-[0.05]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />

        {/* Content Container */}
        <div className={`relative z-10 flex items-center justify-center min-h-[calc(100vh-8rem)] py-8 md:py-12 px-4 sm:px-6 lg:px-8 ${className}`}>
          {children}
        </div>
      </main>

      {/* Site Footer */}
      <SiteFooter />
    </div>
  )
}

