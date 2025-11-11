"use client"

import type React from "react"
import { useState } from "react"
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
import { PasswordStrength } from "@/components/auth/password-strength"
import Link from "next/link"
import { Loader2, UserPlus, Mail, Lock, User, BookOpen, Award, Users } from "lucide-react"
import { notifications } from "@/lib/notifications"
import { cn } from "@/lib/utils"
import { generateStrongPassword } from "@/lib/utils/password-generator"

/**
 * Signup Form Schema
 * Validates all signup fields including password strength requirements
 */
const signupSchema = z
  .object({
    fullName: z
      .string()
      .min(1, "Full name is required")
      .min(2, "Full name must be at least 2 characters")
      .max(100, "Full name must be less than 100 characters"),
    email: z.string().min(1, "Email is required").email("Please enter a valid email address"),
    password: z
      .string()
      .min(1, "Password is required")
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one number")
      .regex(/[!@#$%^&*(),.?":{}|<>]/, "Password must contain at least one special character"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
    role: z.enum(["learner", "instructor", "group_admin"]).default("learner"),
    language: z.enum(["en", "ne"]).default("en"),
    termsAccepted: z.boolean().refine((val) => val === true, {
      message: "You must accept the terms of service",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })

type SignupFormData = z.infer<typeof signupSchema>

/**
 * Signup Page Component
 *
 * Enhanced signup page with:
 * - Comprehensive form validation using Zod
 * - Password strength indicator
 * - Password visibility toggle
 * - Role and language selection with icons
 * - Terms of service checkbox
 * - Real-time validation feedback
 * - Toast notifications
 * - Loading states
 * - Smooth animations
 * - Accessibility features
 */
export default function SignUpPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    mode: "onBlur",
    defaultValues: {
      role: "learner",
      language: "en",
      termsAccepted: false,
    },
  })

  // Watch password for strength indicator
  const password = watch("password") || ""

  // Generate strong password handler
  const handleGeneratePassword = () => {
    const newPassword = generateStrongPassword(16)
    setValue("password", newPassword)
    setValue("confirmPassword", newPassword)
    notifications.showSuccess({
      title: "Strong password generated!",
      description: "Password has been filled in both fields.",
    })
  }

  /**
   * Handle form submission
   * Creates new user account with Supabase and redirects to verification page
   */
  const onSubmit = async (data: SignupFormData) => {
    setIsLoading(true)
    const supabase = createClient()

    try {
      // Create user account
      const { error: signUpError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          emailRedirectTo:
            process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ||
            `${window.location.origin}/auth/verify`,
          data: {
            full_name: data.fullName,
            role: data.role,
            preferred_language: data.language,
          },
        },
      })

      if (signUpError) {
        // Handle specific error cases
        if (signUpError.message.includes("User already registered")) {
          notifications.showError({
            title: "Email already registered",
            description:
              "This email is already associated with an account. Please sign in instead.",
          })
        } else if (signUpError.message.includes("Password")) {
          notifications.showError({
            title: "Password validation failed",
            description: signUpError.message,
          })
        } else {
          notifications.showError({
            title: "Sign up failed",
            description: signUpError.message,
          })
        }
        return
      }

      // Show success toast
      notifications.showSuccess({
        title: "Account created successfully!",
        description: "Please check your email to verify your account.",
      })

      // Redirect to verification page
      setTimeout(() => {
        router.push("/auth/verify")
      }, 1000)
    } catch (error: unknown) {
      console.error("Signup error:", error)
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
      <div className="w-full max-w-7xl mx-auto px-0 sm:px-6 lg:pl-2 lg:pr-4 xl:pl-0 xl:pr-8">
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-16 items-center">
          {/* Left Side - Signup Form */}
          <div className="w-full lg:col-span-6 order-2 lg:order-1 lg:pr-4">
            <Card className="border-2 border-primary/10 shadow-2xl backdrop-blur-sm bg-card/95 dark:bg-card/90 overflow-hidden relative">
              {/* Decorative gradient overlay */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#190482] via-[#7752FE] to-[#8E8FFA]" />

              <CardHeader className="space-y-3 text-center pb-6 pt-6">
                {/* Logo/Icon with enhanced design */}
                <div className="mx-auto w-16 h-16 bg-gradient-to-br from-[#190482] via-[#7752FE] to-[#8E8FFA] rounded-2xl flex items-center justify-center mb-2 shadow-lg shadow-primary/25">
                  <UserPlus className="w-8 h-8 text-white" />
                </div>

                <div className="space-y-2">
                  <CardTitle className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                    Create Account
                  </CardTitle>
                  <CardDescription className="text-base">
                    Join thousands of learners on GyanPath
                  </CardDescription>
                </div>
              </CardHeader>

              <CardContent className="pt-0 pb-6 px-6 sm:px-8">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  {/* Full Name Input */}
                  <div className="space-y-2">
                    <Label htmlFor="fullName" className="text-sm font-semibold text-foreground">
                      Full Name
                    </Label>
                    <div className="relative group">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                      <Input
                        id="fullName"
                        type="text"
                        placeholder="John Doe"
                        className={cn(
                          "pl-11 h-12 text-base transition-all duration-200 border-2",
                          "focus:ring-2 focus:ring-primary/20 focus:border-primary",
                          "hover:border-[#7752FE]",
                          errors.fullName && "border-destructive focus:ring-destructive/20"
                        )}
                        aria-invalid={errors.fullName ? "true" : "false"}
                        aria-describedby={errors.fullName ? "fullName-error" : undefined}
                        disabled={isLoading}
                        {...register("fullName")}
                      />
                    </div>
                    {errors.fullName && (
                      <p
                        id="fullName-error"
                        className="text-sm text-destructive flex items-center gap-1.5 mt-1.5"
                        role="alert"
                      >
                        <span className="w-1 h-1 rounded-full bg-destructive" />
                        {errors.fullName.message}
                      </p>
                    )}
                  </div>

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
                          "hover:border-[#7752FE]",
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
                    <Label htmlFor="password" className="text-sm font-semibold text-foreground">
                      Password
                    </Label>
                    <div className="relative group">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors z-10" />
                      <PasswordInput
                        id="password"
                        placeholder="Create a strong password"
                        showGenerateButton={true}
                        onGeneratePassword={handleGeneratePassword}
                        className={cn(
                          "pl-11 h-12 text-base transition-all duration-200 border-2",
                          "focus:ring-2 focus:ring-primary/20 focus:border-primary",
                          "hover:border-[#7752FE]",
                          errors.password && "border-destructive focus:ring-destructive/20"
                        )}
                        aria-invalid={errors.password ? "true" : "false"}
                        aria-describedby={errors.password ? "password-error" : undefined}
                        disabled={isLoading}
                        {...register("password")}
                      />
                    </div>
                    {/* Password Strength Indicator */}
                    {password && (
                      <div className="mt-2">
                        <PasswordStrength password={password} />
                      </div>
                    )}
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
                  </div>

                  {/* Confirm Password Input */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="confirmPassword"
                      className="text-sm font-semibold text-foreground"
                    >
                      Confirm Password
                    </Label>
                    <div className="relative group">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors z-10" />
                      <PasswordInput
                        id="confirmPassword"
                        placeholder="Confirm your password"
                        showGenerateButton={false}
                        className={cn(
                          "pl-11 h-12 text-base transition-all duration-200 border-2",
                          "focus:ring-2 focus:ring-primary/20 focus:border-primary",
                          "hover:border-[#7752FE]",
                          errors.confirmPassword && "border-destructive focus:ring-destructive/20"
                        )}
                        aria-invalid={errors.confirmPassword ? "true" : "false"}
                        aria-describedby={
                          errors.confirmPassword ? "confirmPassword-error" : undefined
                        }
                        disabled={isLoading}
                        {...register("confirmPassword")}
                      />
                    </div>
                    {errors.confirmPassword && (
                      <p
                        id="confirmPassword-error"
                        className="text-sm text-destructive flex items-center gap-1.5 mt-1.5"
                        role="alert"
                      >
                        <span className="w-1 h-1 rounded-full bg-destructive" />
                        {errors.confirmPassword.message}
                      </p>
                    )}
                  </div>

                  {/* Terms of Service Checkbox */}
                  <div className="space-y-2">
                    <div className="flex items-start gap-3">
                      <Checkbox
                        id="termsAccepted"
                        checked={watch("termsAccepted")}
                        onCheckedChange={(checked) => setValue("termsAccepted", checked === true)}
                        disabled={isLoading}
                        className={cn("mt-0.5", errors.termsAccepted && "border-destructive")}
                        aria-invalid={errors.termsAccepted ? "true" : "false"}
                      />
                      <Label
                        htmlFor="termsAccepted"
                        className="text-sm font-normal leading-relaxed cursor-pointer"
                      >
                        I agree to the{" "}
                        <Link
                          href="/terms"
                          className="text-muted-foreground hover:text-[#7752FE] transition-colors no-underline"
                          target="_blank"
                        >
                          Terms of Service
                        </Link>{" "}
                        and{" "}
                        <Link
                          href="/privacy"
                          className="text-muted-foreground hover:text-[#7752FE] transition-colors no-underline"
                          target="_blank"
                        >
                          Privacy Policy
                        </Link>
                      </Label>
                    </div>
                    {errors.termsAccepted && (
                      <p
                        className="text-sm text-destructive flex items-center gap-1.5 mt-1.5 ml-7"
                        role="alert"
                      >
                        <span className="w-1 h-1 rounded-full bg-destructive" />
                        {errors.termsAccepted.message}
                      </p>
                    )}
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    className="w-full h-12 text-base font-semibold bg-gradient-to-r from-[#190482] via-[#7752FE] to-[#8E8FFA] hover:from-[#190482]/90 hover:via-[#7752FE]/90 hover:to-[#8E8FFA]/90 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl shadow-primary/25 mt-4"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Creating your account...
                      </>
                    ) : (
                      <>
                        <UserPlus className="mr-2 h-5 w-5" />
                        Create Account
                      </>
                    )}
                  </Button>

                  {/* Sign In Link */}
                  <div className="text-center text-sm pt-4 border-t border-border">
                    <span className="text-muted-foreground">Already have an account? </span>
                    <Link
                      href="/auth/login"
                      className="text-muted-foreground font-semibold hover:text-[#7752FE] transition-colors no-underline"
                    >
                      Sign in
                    </Link>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Right Side - Visual Content */}
          <div className="hidden lg:block relative lg:col-span-4 order-1 lg:order-2 lg:pl-4">
            <div className="relative z-10 space-y-6">
              <div className="space-y-4">
                <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-[#190482] via-[#7752FE] to-[#8E8FFA] bg-clip-text text-transparent whitespace-nowrap">
                  Join GyanPath Today
                </h1>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  Start your learning journey with access to thousands of courses, expert
                  instructors, and offline learning capabilities.
                </p>
              </div>

              {/* Feature List */}
              <div className="space-y-4 pt-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <BookOpen className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Free Forever</h3>
                    <p className="text-sm text-muted-foreground">
                      Access all courses and features at no cost
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Award className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Earn Certificates</h3>
                    <p className="text-sm text-muted-foreground">
                      Get certified upon course completion
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Users className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Learn Offline</h3>
                    <p className="text-sm text-muted-foreground">
                      Download courses and learn anywhere, anytime
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Decorative Elements */}
            <div className="absolute -top-10 -right-10 w-72 h-72 bg-gradient-to-br from-primary/20 to-primary/5 rounded-full blur-3xl -z-10" />
            <div className="absolute -bottom-10 -left-10 w-96 h-96 bg-gradient-to-br from-[#8E8FFA]/20 to-[#7752FE]/5 rounded-full blur-3xl -z-10" />
          </div>
        </div>
      </div>
    </AuthLayout>
  )
}
