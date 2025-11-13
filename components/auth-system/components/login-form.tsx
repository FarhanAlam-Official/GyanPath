"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Mail, Lock, AlertCircle } from "lucide-react"
import { useAuth } from "./auth-provider"
import { loginSchema, type LoginFormData } from "../lib/auth-validation"
import { notifications } from "../lib/notifications"

export function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { signIn, signInWithGoogle, signInWithGithub, resendVerificationEmail } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const [isGithubLoading, setIsGithubLoading] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [isResendingVerification, setIsResendingVerification] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: "onBlur"
  })

  const handleResendVerification = async (email: string) => {
    setIsResendingVerification(true)
    try {
      const { error } = await resendVerificationEmail(email)
      if (error) {
        notifications.showError({
          title: "Failed to resend verification",
          description: error.message || "Please try again later."
        })
      } else {
        notifications.showSuccess("Verification email sent! Please check your inbox and spam folder.")
      }
    } catch (error: any) {
      notifications.showError({
        title: "Failed to resend verification",
        description: "An unexpected error occurred. Please try again."
      })
    } finally {
      setIsResendingVerification(false)
    }
  }

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true)
    
    try {
      const { error } = await signIn(data.email, data.password, rememberMe)

      if (error) {
        console.error("Login error:", error)
        
        // Handle unconfirmed email case with custom notification and resend option
        if (error.type === 'email_not_confirmed') {
          notifications.showWarning("Email not verified. Please check your inbox for the verification email.")
          
          // Auto-trigger resend verification email after a brief delay
          setTimeout(() => {
            handleResendVerification(data.email)
          }, 2000)
          
          setIsLoading(false)
          return
        }
        
        notifications.showError({
          title: "Login failed",
          description: error.message === "Invalid login credentials" 
            ? "Invalid email or password. Please check your credentials and try again."
            : error.message || "Login failed. Please try again."
        })
        setIsLoading(false)
        return
      }

      const redirect = searchParams.get("redirect") || "/"
      notifications.showSuccess("Welcome back! Login successful.")
      router.push(redirect)
      router.refresh()
    } catch (error: any) {
      console.error("Login failed:", error)
      notifications.showError({
        title: "Login failed",
        description: "An unexpected error occurred. Please try again."
      })
      setIsLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true)
    try {
      const { error } = await signInWithGoogle()
      if (error) {
        notifications.showError({
          description: error.message || "Failed to sign in with Google. Please try again."
        })
      }
    } catch (error: any) {
      notifications.showError({
        description: "An unexpected error occurred. Please try again."
      })
    } finally {
      setIsGoogleLoading(false)
    }
  }

  const handleGithubSignIn = async () => {
    setIsGithubLoading(true)
    try {
      const { error } = await signInWithGithub()
      if (error) {
        notifications.showError({
          description: error.message || "Failed to sign in with GitHub. Please try again."
        })
      }
    } catch (error: any) {
      notifications.showError({
        description: "An unexpected error occurred. Please try again."
      })
    } finally {
      setIsGithubLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Email Field */}
        <div className="space-y-2">
          <label 
            htmlFor="email" 
            className="text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Email Address
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Mail className="h-4 w-4 text-gray-400" />
            </div>
            <input
              id="email"
              type="email"
              placeholder="Enter your email"
              className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.email ? "border-red-500" : "border-gray-300 dark:border-gray-600"
              } bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100`}
              disabled={isLoading}
              {...register("email")}
            />
          </div>
          {errors.email && (
            <div className="flex items-center space-x-1 text-sm text-red-600">
              <AlertCircle className="h-3 w-3" />
              <span>{errors.email.message}</span>
            </div>
          )}
        </div>

        {/* Password Field */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label 
              htmlFor="password" 
              className="text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Password
            </label>
            <Link 
              href="/auth/forgot-password" 
              className="text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-4 w-4 text-gray-400" />
            </div>
            <input
              id="password"
              type="password"
              placeholder="Enter your password"
              className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.password ? "border-red-500" : "border-gray-300 dark:border-gray-600"
              } bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100`}
              disabled={isLoading}
              {...register("password")}
            />
          </div>
          {errors.password && (
            <div className="flex items-center space-x-1 text-sm text-red-600">
              <AlertCircle className="h-3 w-3" />
              <span>{errors.password.message}</span>
            </div>
          )}
        </div>

        {/* Remember Me */}
        <div className="flex items-center space-x-2">
          <input 
            id="remember" 
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <label 
            htmlFor="remember" 
            className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer"
          >
            Remember me
          </label>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200"
        >
          {isLoading ? "Signing in..." : "Sign In"}
        </button>
      </form>

      {/* Social Login Buttons */}
      <div className="space-y-3">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-gray-300 dark:border-gray-600" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white dark:bg-gray-900 px-2 text-gray-500 dark:text-gray-400">
              Or continue with
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isGoogleLoading || isGithubLoading || isLoading}
            className="w-full py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-lg font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200 disabled:opacity-50"
          >
            {isGoogleLoading ? "Loading..." : "Google"}
          </button>
          <button
            type="button"
            onClick={handleGithubSignIn}
            disabled={isGithubLoading || isGoogleLoading || isLoading}
            className="w-full py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-lg font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200 disabled:opacity-50"
          >
            {isGithubLoading ? "Loading..." : "GitHub"}
          </button>
        </div>
      </div>

      {/* Sign Up Link */}
      <div className="text-center">
        <span className="text-sm text-gray-600 dark:text-gray-400">
          Don't have an account?{" "}
        </span>
        <Link 
          href="/auth/signup" 
          className="text-sm font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
        >
          Create an account
        </Link>
      </div>
    </div>
  )
}