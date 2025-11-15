"use client"

import { useEffect } from "react"
import GenericErrorPage from "@/components/error-pages/GenericErrorPage"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log error to error tracking service
    console.error("Global error:", error)
  }, [error])

  return (
    <html>
      <body>
        <GenericErrorPage 
          error={error}
          reset={reset}
          errorTitle="Application Error"
          errorMessage="A critical error occurred. Please refresh the page or contact support if the problem persists."
        />
      </body>
    </html>
  )
}

