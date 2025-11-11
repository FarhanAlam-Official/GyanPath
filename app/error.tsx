"use client"

import { useEffect } from "react"
import GenericErrorPage from "@/components/error-pages/GenericErrorPage"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log error to error tracking service (e.g., Sentry)
    console.error("Application error:", error)
  }, [error])

  return (
    <GenericErrorPage 
      error={error}
      reset={reset}
      errorTitle="Something went wrong!"
      errorMessage="We encountered an unexpected error. Please try again or return to the home page."
    />
  )
}

