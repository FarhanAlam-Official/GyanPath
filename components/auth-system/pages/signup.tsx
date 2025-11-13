import { Suspense } from "react"
import { SignupForm } from "../components/signup-form"
import { AuthSkeleton } from "../components/auth-skeleton"
import { AuthLayout } from "../components/auth-layout"

export default function SignupPage() {
  return (
    <Suspense fallback={<AuthSkeleton />}>
      <AuthLayout
        title="Create Account"
        description="Join us and get started today"
        gradientFrom="from-green-600"
        gradientTo="to-emerald-600"
        darkGradientFrom="from-green-400"
        darkGradientTo="to-emerald-400"
      >
        <SignupForm />
      </AuthLayout>
    </Suspense>
  )
}