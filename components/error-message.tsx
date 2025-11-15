import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface ErrorMessageProps {
  title?: string
  message: string
  onDismiss?: () => void
  className?: string
  variant?: "default" | "destructive"
}

export function ErrorMessage({
  title = "Error",
  message,
  onDismiss,
  className,
  variant = "destructive",
}: ErrorMessageProps) {
  return (
    <Alert variant={variant} className={cn("relative", className)}>
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>{message}</AlertDescription>
      {onDismiss && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-2 top-2 h-6 w-6"
          onClick={onDismiss}
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </Alert>
  )
}

