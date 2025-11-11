"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { createClient } from "@/lib/supabase/client"
import { AuthLayout } from "@/components/auth/auth-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { PasswordInput } from "@/components/auth/password-input"
import Link from "next/link"
import { Loader2, LogIn, Mail, Lock, BookOpen, Award, Users } from "lucide-react"
import { notifications } from "@/lib/notifications"
import { cn } from "@/lib/utils"
import { setSessionPreference, clearSessionPreference } from "@/lib/auth/session"

/**
 * Login Form Schema
 * Validates email format and ensures password is provided
 */
const loginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Please enter a valid email address"),
  password: z
    .string()
    .min(1, "Password is required")
    .min(6, "Password must be at least 6 characters"),
  rememberMe: z.boolean().default(false),
})

type LoginFormData = z.infer<typeof loginSchema>

/**
 * Login Page Component
 *
 * Enhanced login page with:
 * - Form validation using Zod and react-hook-form
 * - Password visibility toggle
 * - Forgot password link
 * - Toast notifications for errors/success
 * - Loading states with spinners
 * - Smooth animations
 * - Role-based redirect after successful login
 * - Accessibility features (ARIA labels, keyboard navigation)
 */
export default function LoginPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: "onBlur", // Validate on blur for better UX
    defaultValues: {
      rememberMe: false,
      email: "",
    },
  })

  // Load remembered email on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const rememberedEmail = localStorage.getItem("rememberedEmail")
      const shouldRemember = localStorage.getItem("rememberMe") === "true"
      if (rememberedEmail && shouldRemember) {
        setValue("email", rememberedEmail)
        setRememberMe(true)
        setValue("rememberMe", true)
      }
    }
  }, [setValue])

  /**
   * Handle form submission
   * Authenticates user with Supabase and redirects based on role
   */
  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true)
    const supabase = createClient()

    try {
      // Sign in with email and password
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      })

      if (signInError) {
        // Handle specific error cases
        if (signInError.message.includes("Invalid login credentials")) {
          notifications.showError({
            title: "Invalid email or password",
            description: "Please check your credentials and try again.",
          })
        } else if (signInError.message.includes("Email not confirmed")) {
          notifications.showError({
            title: "Email not verified",
            description: "Please verify your email before signing in.",
          })
        } else {
          notifications.showError({
            title: "Login failed",
            description: signInError.message,
          })
        }
        return
      }

      // Get user profile to determine role-based redirect
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .single()

      if (profileError) {
        console.error("Error fetching profile:", profileError)
        // Still allow login, redirect to default dashboard
        router.push("/learner")
        return
      }

      // Handle remember me functionality
      if (data.rememberMe) {
        // Store email for auto-fill
        localStorage.setItem("rememberedEmail", data.email)
        localStorage.setItem("rememberMe", "true")

        // Set session preference for 30-day persistence
        setSessionPreference(true)

        // Set a cookie that the server can read to configure session duration
        const secureFlag = process.env.NODE_ENV === "production" ? "; Secure" : ""
        document.cookie = `sb-session-preference=remember_me; path=/; max-age=${30 * 24 * 60 * 60}; SameSite=Lax${secureFlag}`
      } else {
        localStorage.removeItem("rememberedEmail")
        localStorage.removeItem("rememberMe")

        // Clear session preference
        clearSessionPreference()

        // Remove the session preference cookie
        document.cookie = `sb-session-preference=; path=/; max-age=0; SameSite=Lax`
      }

      // Show success toast
      notifications.showSuccess({
        title: "Welcome back!",
        description: "Redirecting to your dashboard...",
      })

      // Small delay to show success message before redirect
      setTimeout(() => {
        // Redirect based on user role
        if (profile?.role === "admin") {
          router.push("/admin")
        } else if (profile?.role === "group_admin") {
          router.push("/group-admin")
        } else if (profile?.role === "instructor") {
          router.push("/instructor")
        } else {
          router.push("/learner")
        }
      }, 500)
    } catch (error: unknown) {
      // Handle unexpected errors
      console.error("Login error:", error)
      notifications.showError({
        title: "An unexpected error occurred",
        description: error instanceof Error ? error.message : "Please try again later.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthLayout>
      <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left Side - Visual Content */}
          <div className="hidden lg:block relative">
            <div className="relative z-10 space-y-6">
              <div className="space-y-4">
                <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-[#190482] via-[#7752FE] to-[#8E8FFA] bg-clip-text text-transparent">
                  Welcome Back to GyanPath
                </h1>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  Continue your learning journey with access to thousands of courses, offline
                  learning, and expert instructors.
                </p>
              </div>

              {/* Feature List */}
              <div className="space-y-4 pt-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <BookOpen className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Offline Learning</h3>
                    <p className="text-sm text-muted-foreground">
                      Access courses even without internet connection
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Award className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Certified Courses</h3>
                    <p className="text-sm text-muted-foreground">
                      Earn certificates upon course completion
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Users className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Expert Instructors</h3>
                    <p className="text-sm text-muted-foreground">
                      Learn from industry professionals
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Decorative Elements */}
            <div className="absolute -top-10 -left-10 w-72 h-72 bg-gradient-to-br from-primary/20 to-primary/5 rounded-full blur-3xl -z-10" />
            <div className="absolute -bottom-10 -right-10 w-96 h-96 bg-gradient-to-br from-[#8E8FFA]/20 to-[#7752FE]/5 rounded-full blur-3xl -z-10" />
          </div>

          {/* Right Side - Login Form */}
          <div className="w-full">
            <Card className="border-2 border-primary/10 shadow-2xl backdrop-blur-sm bg-card/95 dark:bg-card/90 overflow-hidden relative">
              {/* Decorative gradient overlay */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#190482] via-[#7752FE] to-[#8E8FFA]" />

              <CardHeader className="space-y-4 text-center pb-8 pt-8">
                {/* Logo/Icon with enhanced design */}
                <div className="mx-auto w-16 h-16 bg-gradient-to-br from-[#190482] via-[#7752FE] to-[#8E8FFA] rounded-2xl flex items-center justify-center mb-2 shadow-lg shadow-primary/25">
                  <LogIn className="w-8 h-8 text-white" />
                </div>

                <div className="space-y-2">
                  <CardTitle className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                    Welcome Back
                  </CardTitle>
                  <CardDescription className="text-base">
                    Sign in to continue your learning journey
                  </CardDescription>
                </div>
              </CardHeader>

              <CardContent className="pt-0 pb-8 px-6 sm:px-8">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                  {/* Email Input */}
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-semibold text-foreground">
                      Email Address
                    </Label>
                    <div className="relative group">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="your@email.com"
                        className={cn(
                          "pl-11 h-12 text-base transition-all duration-200 border-2",
                          "focus:ring-2 focus:ring-primary/20 focus:border-primary",
                          "hover:border-primary/50",
                          errors.email && "border-destructive focus:ring-destructive/20"
                        )}
                        aria-invalid={errors.email ? "true" : "false"}
                        aria-describedby={errors.email ? "email-error" : undefined}
                        disabled={isLoading}
                        {...register("email")}
                      />
                    </div>
                    {errors.email && (
                      <p
                        id="email-error"
                        className="text-sm text-destructive flex items-center gap-1.5 mt-1.5"
                        role="alert"
                      >
                        <span className="w-1 h-1 rounded-full bg-destructive" />
                        {errors.email.message}
                      </p>
                    )}
                  </div>

                  {/* Password Input */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password" className="text-sm font-semibold text-foreground">
                        Password
                      </Label>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="rememberMe"
                          checked={rememberMe}
                          onCheckedChange={(checked) => {
                            setRememberMe(checked === true)
                            setValue("rememberMe", checked === true)
                          }}
                        />
                        <Label
                          htmlFor="rememberMe"
                          className="text-sm font-normal text-muted-foreground hover:text-[#7752FE] cursor-pointer leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          Remember me
                        </Label>
                      </div>
                    </div>
                    <div className="relative group">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors z-10" />
                      <PasswordInput
                        id="password"
                        placeholder="Enter your password"
                        className={cn(
                          "pl-11 h-12 text-base transition-all duration-200 border-2",
                          "focus:ring-2 focus:ring-primary/20 focus:border-primary",
                          "hover:border-primary/50",
                          errors.password && "border-destructive focus:ring-destructive/20"
                        )}
                        aria-invalid={errors.password ? "true" : "false"}
                        aria-describedby={errors.password ? "password-error" : undefined}
                        disabled={isLoading}
                        {...register("password")}
                      />
                    </div>
                    {errors.password && (
                      <p
                        id="password-error"
                        className="text-sm text-destructive flex items-center gap-1.5 mt-1.5"
                        role="alert"
                      >
                        <span className="w-1 h-1 rounded-full bg-destructive" />
                        {errors.password.message}
                      </p>
                    )}
                    {/* Forgot Password Link - Centered below password field */}
                    <div className="flex justify-center pt-1">
                      <Link
                        href="/auth/forgot-password"
                        className="text-sm text-muted-foreground hover:text-[#7752FE] transition-colors font-medium no-underline flex items-center gap-1.5"
                      >
                        Forgot password?
                      </Link>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    className="w-full h-12 text-base font-semibold bg-gradient-to-r from-[#190482] via-[#7752FE] to-[#8E8FFA] hover:from-[#190482]/90 hover:via-[#7752FE]/90 hover:to-[#8E8FFA]/90 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl shadow-primary/25 mt-6"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Signing in...
                      </>
                    ) : (
                      <>
                        <LogIn className="mr-2 h-5 w-5" />
                        Sign In
                      </>
                    )}
                  </Button>

                  {/* Sign Up Link */}
                  <div className="text-center text-sm pt-4 border-t border-border">
                    <span className="text-muted-foreground">Don't have an account? </span>
                    <Link
                      href="/auth/signup"
                      className="text-muted-foreground font-semibold hover:text-[#7752FE] transition-colors no-underline"
                    >
                      Create an account
                    </Link>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AuthLayout>
  )
}
