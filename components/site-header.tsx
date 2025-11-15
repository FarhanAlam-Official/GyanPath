"use client"

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { Menu, X, LogOut, Home, BookOpen, Sparkles, Puzzle, Info, Phone } from "lucide-react"
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

  // Desktop navigation items
  const navItems = [
    { href: "/", label: "Home", icon: Home },
    { href: "/courses", label: "Courses", icon: BookOpen },
    { href: "/features", label: "Features", icon: Sparkles },
    { href: "/how-it-works", label: "How It Works", icon: Puzzle },
    { href: "/about", label: "About", icon: Info },
    { href: "/contact", label: "Contact", icon: Phone },
  ]

  return (
    <header className="border-b bg-white/80 backdrop-blur-xl sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
          >
            <Link href="/" className="flex items-center gap-2.5 group focus:outline-none">
              <div className="group-hover:opacity-90 transition-all duration-300">
                <motion.div
                  animate={{ rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 3 }}
                >
                  <Image
                    src="/logo.png"
                    alt="GyanPath logo"
                    width={40}
                    height={40}
                    className="h-10 w-10 object-contain transition-transform duration-300 transform group-hover:scale-105 rounded-md"
                    priority
                  />
                </motion.div>
              </div>
              <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent font-bold text-lg tracking-tight group-hover:from-indigo-700 group-hover:to-purple-700 transition-all duration-300">
                GyanPath
              </span>
            </Link>
          </motion.div>

          {/* Desktop Navigation - Moved to right side */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive =
                item.href === "/" ? pathname === "/" : pathname?.startsWith(item.href)
              const Icon = item.icon
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`group relative px-3 py-2 rounded-lg transition-all duration-300 ${
                    isActive
                      ? "text-indigo-600 font-semibold"
                      : "text-slate-600 hover:text-indigo-600 hover:bg-indigo-50"
                  }`}
                >
                  <div className="flex items-center gap-2 text-sm font-medium">
                    {Icon ? (
                      <Icon className="w-4 h-4 transition-transform duration-300 group-hover:scale-110" />
                    ) : null}
                    <span>{item.label}</span>
                  </div>
                  {isActive && (
                    <motion.span
                      layoutId="active-nav-underline"
                      className="absolute left-3 right-3 -bottom-[2px] h-[3px] rounded-full bg-gradient-to-r from-indigo-600 to-purple-600"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    />
                  )}
                </Link>
              )
            })}
          </nav>

          {/* User Navigation - Positioned on the far right */}
          <div className="flex items-center gap-2">
            <ThemeToggle />
            {loading ? (
              // Show minimal loading indicator that matches the expected size
              <div className="flex items-center gap-2 px-3 py-2 h-10">
                <div className="w-8 h-8 rounded-full bg-muted/50 animate-pulse" />
                <div className="w-24 h-4 bg-muted/50 rounded animate-pulse" />
              </div>
            ) : user && profile ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <motion.button
                    className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted transition-all duration-300 group"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Avatar className="w-8 h-8 ring-2 ring-transparent group-hover:ring-indigo-600 transition-all duration-300">
                      <AvatarImage
                        src={profile.avatar_url || ""}
                        alt={profile.full_name || "User"}
                      />
                      <AvatarFallback className="bg-gradient-to-br from-indigo-600 to-purple-600 text-white text-sm">
                        {getUserInitials()}
                      </AvatarFallback>
                    </Avatar>
                    <motion.span
                      className="text-sm font-medium max-w-[120px] truncate hidden md:block"
                      whileHover={{ x: 2 }}
                    >
                      {profile.full_name || user.email}
                    </motion.span>
                  </motion.button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-56 overflow-hidden rounded-xl shadow-lg"
                  sideOffset={5}
                >
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {profile.full_name || user.email}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href={getDashboardPath()}>
                      <motion.div
                        className="w-full"
                        whileHover={{ x: 5 }}
                        transition={{ type: "spring", stiffness: 500 }}
                      >
                        Dashboard
                      </motion.div>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href={`${getDashboardPath()}/profile`}>
                      <motion.div
                        className="w-full"
                        whileHover={{ x: 5 }}
                        transition={{ type: "spring", stiffness: 500 }}
                      >
                        Profile
                      </motion.div>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleSignOut}
                    className="text-destructive focus:bg-destructive/10 focus:text-destructive"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <Button
                  variant="ghost"
                  asChild
                  className="text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 transition-all duration-300 rounded-lg px-3.5 py-2 text-sm font-medium"
                >
                  <Link href="/auth/login">Sign In</Link>
                </Button>
                <Button
                  asChild
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white transition-all duration-500 transform hover:scale-105 hover:shadow-lg rounded-lg px-4 py-2 text-sm font-medium shadow-sm"
                >
                  <Link href="/auth/signup">Get Started</Link>
                </Button>
              </div>
            )}

            {/* Mobile Menu */}
            <div className="md:hidden flex items-center gap-2">
              <motion.button
                className="p-2 rounded-lg hover:bg-muted transition-colors"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Toggle menu"
                whileTap={{ scale: 0.9 }}
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <motion.div
          className="md:hidden border-t bg-background"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        >
          <nav className="container mx-auto px-4 py-4 flex flex-col gap-4">
            {navItems.map((item) => {
              const isActive =
                item.href === "/" ? pathname === "/" : pathname?.startsWith(item.href)
              const Icon = item.icon
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`text-sm font-medium transition-colors py-2 px-3 rounded-lg ${
                    isActive
                      ? "text-indigo-600 bg-indigo-50 font-semibold"
                      : "text-foreground/80 hover:text-indigo-600 hover:bg-indigo-50"
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <div className="flex items-center gap-2">
                    {Icon ? <Icon className="w-4 h-4" /> : null}
                    <span>{item.label}</span>
                  </div>
                </Link>
              )
            })}

            <div className="flex flex-col gap-2 pt-2 border-t mt-2">
              {loading ? (
                // Show minimal loading indicator
                <div className="flex items-center gap-2 px-2 py-2">
                  <div className="w-8 h-8 rounded-full bg-muted/50 animate-pulse" />
                  <div className="flex-1 h-4 bg-muted/50 rounded animate-pulse" />
                </div>
              ) : user && profile ? (
                <>
                  <div className="flex items-center gap-2 px-2 py-2">
                    <Avatar className="w-8 h-8">
                      <AvatarImage
                        src={profile.avatar_url || ""}
                        alt={profile.full_name || "User"}
                      />
                      <AvatarFallback className="bg-gradient-to-br from-indigo-600 to-purple-600 text-white text-sm">
                        {getUserInitials()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">{profile.full_name || user.email}</span>
                      <span className="text-xs text-muted-foreground">{user.email}</span>
                    </div>
                  </div>
                  <Button asChild variant="ghost" size="sm" className="justify-start">
                    <Link href={getDashboardPath()} onClick={() => setMobileMenuOpen(false)}>
                      Dashboard
                    </Link>
                  </Button>
                  <Button asChild variant="ghost" size="sm" className="justify-start">
                    <Link
                      href={`${getDashboardPath()}/profile`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Profile
                    </Link>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="justify-start text-destructive hover:bg-destructive/10"
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
                <div className="flex flex-col gap-2">
                  <Button
                    asChild
                    variant="ghost"
                    size="sm"
                    className="justify-start text-slate-600 hover:text-indigo-600 hover:bg-indigo-50"
                  >
                    <Link href="/auth/login" onClick={() => setMobileMenuOpen(false)}>
                      Sign In
                    </Link>
                  </Button>
                  <Button
                    asChild
                    className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white transition-all duration-500 transform hover:scale-105 hover:shadow-lg rounded-lg px-4 py-2 text-sm font-medium shadow-sm"
                  >
                    <Link href="/auth/signup" onClick={() => setMobileMenuOpen(false)}>
                      Get Started
                    </Link>
                  </Button>
                </div>
              )}
            </div>
          </nav>
        </motion.div>
      )}
    </header>
  )
}
