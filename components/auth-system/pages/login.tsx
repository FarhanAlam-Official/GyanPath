import { Suspense } from "react"
import { LoginForm } from "../components/login-form"
import { AuthSkeleton } from "../components/auth-skeleton"
import { AuthLayout } from "../components/auth-layout"

export default function LoginPage() {
  return (
    <Suspense fallback={<AuthSkeleton />}>
      <AuthLayout
        title="Welcome Back"
        description="Sign in to access your dashboard"
        gradientFrom="from-blue-600"
        gradientTo="to-cyan-600"
        darkGradientFrom="from-blue-400"
        darkGradientTo="to-cyan-400"
      >
        <LoginForm />
      </AuthLayout>
    </Suspense>
  )
}