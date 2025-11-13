"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { User, Mail, Lock, AlertCircle, CheckCircle } from "lucide-react"
import { useAuth } from "./auth-provider"
import { signupSchema, type SignupFormData } from "../lib/auth-validation"
import { notifications } from "../lib/notifications"

export function SignupForm() {
  const router = useRouter()
  const { signUp, signInWithGoogle, signInWithGithub, resendVerificationEmail } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const [isGithubLoading, setIsGithubLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [signupEmail, setSignupEmail] = useState<string>("")

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    mode: "onBlur"
  })

  const onSubmit = async (data: SignupFormData) => {
    setIsLoading(true)
    
    try {
      const { error } = await signUp(data.email, data.password, data.fullName)
      
      // Store the email for potential resend
      setSignupEmail(data.email)
      
      if (error) {
        console.error("Signup error:", error)
        notifications.showError({
          title: "Signup failed",
          description: error.message || "Failed to create account. Please try again."
        })
        setIsLoading(false)
        return
      }

      console.log("Signup successful")
      setIsSuccess(true)
      notifications.showSuccess("Account created successfully! Please check your email to verify your account.")
    } catch (error: any) {
      console.error("Signup failed:", error)
      notifications.showError({
        title: "Signup failed",
        description: "An unexpected error occurred. Please try again."
      })
      setIsLoading(false)
    }
  }

  const handleResendVerification = async () => {
    if (!signupEmail) return
    
    try {
      const { error } = await resendVerificationEmail(signupEmail)
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
    }
  }

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true)
    try {
      const { error } = await signInWithGoogle()
      if (error) {
        notifications.showError({
          description: error.message || "Failed to sign up with Google. Please try again."
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
          description: error.message || "Failed to sign up with GitHub. Please try again."
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

  if (isSuccess) {
    return (
      <div className="space-y-6">
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <CheckCircle className="h-16 w-16 text-green-500" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            Account Created Successfully!
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            We've sent a verification email to <strong>{signupEmail}</strong>. 
            Please check your inbox and click the verification link to activate your account.
          </p>
          <div className="space-y-4">
            <button
              onClick={handleResendVerification}
              className="text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
            >
              Didn't receive the email? Resend verification
            </button>
            <div className="text-center">
              <Link 
                href="/auth/login" 
                className="text-sm font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
              >
                Back to Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Full Name Field */}
        <div className="space-y-2">
          <label 
            htmlFor="fullName" 
            className="text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Full Name
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <User className="h-4 w-4 text-gray-400" />
            </div>
            <input
              id="fullName"
              type="text"
              placeholder="Enter your full name"
              className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.fullName ? "border-red-500" : "border-gray-300 dark:border-gray-600"
              } bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100`}
              disabled={isLoading}
              {...register("fullName")}
            />
          </div>
          {errors.fullName && (
            <div className="flex items-center space-x-1 text-sm text-red-600">
              <AlertCircle className="h-3 w-3" />
              <span>{errors.fullName.message}</span>
            </div>
          )}
        </div>

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
          <label 
            htmlFor="password" 
            className="text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Password
          </label>
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

        {/* Confirm Password Field */}
        <div className="space-y-2">
          <label 
            htmlFor="confirmPassword" 
            className="text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Confirm Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-4 w-4 text-gray-400" />
            </div>
            <input
              id="confirmPassword"
              type="password"
              placeholder="Confirm your password"
              className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.confirmPassword ? "border-red-500" : "border-gray-300 dark:border-gray-600"
              } bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100`}
              disabled={isLoading}
              {...register("confirmPassword")}
            />
          </div>
          {errors.confirmPassword && (
            <div className="flex items-center space-x-1 text-sm text-red-600">
              <AlertCircle className="h-3 w-3" />
              <span>{errors.confirmPassword.message}</span>
            </div>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200"
        >
          {isLoading ? "Creating Account..." : "Create Account"}
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
              Or sign up with
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

      {/* Login Link */}
      <div className="text-center">
        <span className="text-sm text-gray-600 dark:text-gray-400">
          Already have an account?{" "}
        </span>
        <Link 
          href="/auth/login" 
          className="text-sm font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
        >
          Sign in
        </Link>
      </div>
    </div>
  )
}