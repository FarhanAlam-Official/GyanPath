import { ReactNode } from "react"

interface AuthLayoutProps {
  children: ReactNode
  title: string
  description: string
  gradientFrom?: string
  gradientTo?: string
  darkGradientFrom?: string
  darkGradientTo?: string
  cardContentClass?: string
}

export function AuthLayout({
  children,
  title,
  description,
  gradientFrom = "from-blue-600",
  gradientTo = "to-cyan-600",
  darkGradientFrom = "from-blue-400",
  darkGradientTo = "to-cyan-400",
  cardContentClass = ""
}: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-white to-cyan-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-700 p-4 animate-fade-in">
      <div className="w-full max-w-lg shadow-2xl border-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-2xl transform transition-all duration-500 hover:shadow-3xl animate-bounce-in p-6">
        <div className="space-y-1 pb-6">
          <h1 className={`text-3xl font-bold text-center bg-gradient-to-r ${gradientFrom} ${gradientTo} dark:${darkGradientFrom} dark:${darkGradientTo} bg-clip-text text-transparent animate-fade-in-up`}>
            {title}
          </h1>
          <p className="text-center text-gray-600 dark:text-gray-400 text-base animate-fade-in-up delay-200">
            {description}
          </p>
        </div>
        <div className={`pt-0 ${cardContentClass}`}>
          {children}
        </div>
      </div>
    </div>
  )
}