"use client"

import type React from "react"
import { cn } from "@/lib/utils"

/**
 * PasswordStrength Component
 * 
 * Visual indicator showing password strength requirements.
 * Displays checkmarks for each requirement that has been met.
 * 
 * @param password - The current password value to check
 */
interface PasswordStrengthProps {
  password: string
  className?: string
}

interface Requirement {
  label: string
  test: (password: string) => boolean
}

const requirements: Requirement[] = [
  {
    label: "At least 8 characters",
    test: (pwd) => pwd.length >= 8,
  },
  {
    label: "Contains uppercase letter",
    test: (pwd) => /[A-Z]/.test(pwd),
  },
  {
    label: "Contains lowercase letter",
    test: (pwd) => /[a-z]/.test(pwd),
  },
  {
    label: "Contains number",
    test: (pwd) => /[0-9]/.test(pwd),
  },
  {
    label: "Contains special character",
    test: (pwd) => /[!@#$%^&*(),.?":{}|<>]/.test(pwd),
  },
]

export function PasswordStrength({ password, className }: PasswordStrengthProps) {
  // Don't show requirements if password is empty
  if (!password) return null

  const metRequirements = requirements.filter((req) => req.test(password))
  const strengthPercentage = (metRequirements.length / requirements.length) * 100

  // Determine gradient based on strength
  const getGradient = () => {
    if (strengthPercentage < 40) {
      return "bg-gradient-to-r from-red-500 to-red-600"
    } else if (strengthPercentage >= 40 && strengthPercentage < 80) {
      return "bg-gradient-to-r from-yellow-500 to-orange-500"
    } else {
      return "bg-gradient-to-r from-[#190482] via-[#7752FE] to-[#8E8FFA]"
    }
  }

  return (
    <div className={cn("space-y-2", className)}>
      {/* Strength Bar */}
      <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
        <div
          className={cn(
            "h-full transition-all duration-300 ease-out rounded-full",
            getGradient()
          )}
          style={{ width: `${strengthPercentage}%` }}
        />
      </div>
    </div>
  )
}

