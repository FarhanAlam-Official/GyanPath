"use client"

import type React from "react"
import { useState } from "react"
import { Eye, EyeOff, RefreshCw } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

/**
 * PasswordInput Component
 * 
 * Enhanced password input with visibility toggle and optional password generation.
 * Provides a clean UI for password fields with show/hide toggle button.
 * 
 * @param className - Additional CSS classes
 * @param showGenerateButton - Whether to show the generate password button
 * @param onGeneratePassword - Callback function when generate button is clicked
 * @param ...props - Standard input props (value, onChange, placeholder, etc.)
 */
interface PasswordInputProps extends React.ComponentProps<typeof Input> {
  className?: string
  showGenerateButton?: boolean
  onGeneratePassword?: () => void
}

export function PasswordInput({ 
  className, 
  showGenerateButton = false,
  onGeneratePassword,
  ...props 
}: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false)

  return (
    <div className="relative">
      <Input
        type={showPassword ? "text" : "password"}
        className={cn(
          showGenerateButton ? "pr-20" : "pr-10",
          className
        )}
        {...props}
      />
      <div className="absolute right-0 top-0 h-full flex items-center gap-1 pr-1">
        {showGenerateButton && onGeneratePassword && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 hover:bg-transparent"
            onClick={onGeneratePassword}
            aria-label="Generate strong password"
            tabIndex={-1}
          >
            <RefreshCw className="h-4 w-4 text-muted-foreground hover:text-[#7752FE] transition-colors" />
          </Button>
        )}
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8 hover:bg-transparent"
          onClick={() => setShowPassword(!showPassword)}
          aria-label={showPassword ? "Hide password" : "Show password"}
          tabIndex={-1}
        >
          {showPassword ? (
            <EyeOff className="h-4 w-4 text-muted-foreground" />
          ) : (
            <Eye className="h-4 w-4 text-muted-foreground" />
          )}
        </Button>
      </div>
    </div>
  )
}

