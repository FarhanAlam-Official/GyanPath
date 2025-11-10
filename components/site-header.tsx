"use client"

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { BookOpen, Menu, X, LogOut, Home } from "lucide-react"
import { useState } from "react"
import { useAuth } from "@/hooks/use-auth"
import { usePathname, useRouter } from "next/navigation"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { motion } from "framer-motion"

export function SiteHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { user, profile, loading, signOut } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  const handleSignOut = async () => {
    await signOut()
    router.push("/")
  }

  const getDashboardPath = () => {
    if (!profile) return "/learner"
    switch (profile.role) {
      case "admin":
        return "/admin"
      case "group_admin":
        return "/group-admin"
      case "instructor":
        return "/instructor"
      default:
        return "/learner"
    }
  }

  const getUserInitials = () => {
    if (!profile?.full_name) return "U"
    return profile.full_name
      .split(" ")
      .map((n: string) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm">
      <div className="container mx-auto px-4 md:px-6 flex h-16 items-center justify-between">
        {/* Logo */}
        <motion.div whileHover={{ scale: 1.03 }} transition={{ type: "spring", stiffness: 300, damping: 20 }}>
          <Link href="/" className="flex items-center gap-2 font-bold text-xl">
            <Image
              src="/logo.png"
              alt="GyanPath logo"
              width={32}
              height={32}
              className="rounded-md"
              priority
            />
            <span className="text-foreground">GyanPath</span>
          </Link>
        </motion.div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          {[
            { href: "/", label: "Home", icon: Home },
            { href: "/features", label: "Features" },
            { href: "/how-it-works", label: "How It Works" },
            { href: "/about", label: "About" },
            { href: "/contact", label: "Contact" },
          ].map((item) => {
            const isActive = item.href === "/" ? pathname === "/" : pathname?.startsWith(item.href)
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                className="group relative px-3 py-2 rounded-md transition-colors hover:bg-muted/60"
              >
                <div className="flex items-center gap-2 text-sm font-medium">
                  {Icon ? <Icon className="w-4 h-4" /> : null}
                  <span className={isActive ? "text-foreground" : "text-foreground/80 group-hover:text-foreground"}>
                    {item.label}
                  </span>
                </div>
                {isActive ? (
                  <motion.span
                    layoutId="active-nav-underline"
                    className="absolute left-2 right-2 -bottom-[2px] h-[2px] rounded-full bg-primary"
                  />
                ) : (
                  <span className="pointer-events-none absolute left-2 right-2 -bottom-[2px] h-[2px] rounded-full bg-transparent group-hover:bg-primary/40 transition-colors" />
                )}
              </Link>
            )
          })}
        </nav>

        {/* Desktop Auth Buttons / User Menu */}
        <div className="hidden md:flex items-center gap-3">
          <ThemeToggle />
          {loading ? (
            // Show minimal loading indicator that matches the expected size
            <div className="flex items-center gap-2 px-3 py-2 h-10">
              <div className="w-8 h-8 rounded-full bg-muted/50" />
              <div className="w-24 h-4 bg-muted/50 rounded" />
            </div>
          ) : user && profile ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted transition-colors">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={profile.avatar_url || ""} alt={profile.full_name || "User"} />
                    <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                      {getUserInitials()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium">{profile.full_name || user.email}</span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href={getDashboardPath()}>Dashboard</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href={`${getDashboardPath()}/profile`}>Profile</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm">
                <Link href="/auth/login">Sign In</Link>
              </Button>
              <Button asChild size="sm">
                <Link href="/auth/signup">Get Started</Link>
              </Button>
            </>
          )}
        </div>

        {/* Mobile Theme Toggle and Menu Button */}
        <div className="md:hidden flex items-center gap-2">
          <ThemeToggle />
          <button className="p-2" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} aria-label="Toggle menu">
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t bg-background">
          <nav className="container mx-auto px-4 md:px-6 py-4 flex flex-col gap-4">
            <Link
              href="/"
              className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              href="/features"
              className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Features
            </Link>
            <Link
              href="/how-it-works"
              className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              How It Works
            </Link>
            <Link
              href="/about"
              className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              About
            </Link>
            <Link
              href="/contact"
              className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Contact
            </Link>
            <div className="flex flex-col gap-2 pt-2 border-t">
              {loading ? (
                // Show minimal loading indicator
                <div className="flex items-center gap-2 px-2 py-2">
                  <div className="w-8 h-8 rounded-full bg-muted/50" />
                  <div className="flex-1 h-4 bg-muted/50 rounded" />
                </div>
              ) : user && profile ? (
                <>
                  <div className="flex items-center gap-2 px-2 py-2">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={profile.avatar_url || ""} alt={profile.full_name || "User"} />
                      <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                        {getUserInitials()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium">{profile.full_name || user.email}</span>
                  </div>
                  <Button asChild variant="ghost" size="sm" className="justify-start">
                    <Link href={getDashboardPath()} onClick={() => setMobileMenuOpen(false)}>
                      Dashboard
                    </Link>
                  </Button>
                  <Button asChild variant="ghost" size="sm" className="justify-start">
                    <Link href={`${getDashboardPath()}/profile`} onClick={() => setMobileMenuOpen(false)}>
                      Profile
                    </Link>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="justify-start text-destructive"
                    onClick={() => {
                      handleSignOut()
                      setMobileMenuOpen(false)
                    }}
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </Button>
                </>
              ) : (
                <>
                  <Button asChild variant="ghost" size="sm">
                    <Link href="/auth/login" onClick={() => setMobileMenuOpen(false)}>Sign In</Link>
                  </Button>
                  <Button asChild size="sm">
                    <Link href="/auth/signup" onClick={() => setMobileMenuOpen(false)}>Get Started</Link>
                  </Button>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
