interface RetryOptions {
  maxAttempts?: number
  delay?: number
  exponentialBackoff?: boolean
  onRetry?: (attempt: number, error: unknown) => void
}

export async function retry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxAttempts = 3,
    delay = 1000,
    exponentialBackoff = true,
    onRetry,
  } = options

  let lastError: unknown

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error

      if (attempt < maxAttempts) {
        const waitTime = exponentialBackoff ? delay * Math.pow(2, attempt - 1) : delay
        onRetry?.(attempt, error)
        await new Promise((resolve) => setTimeout(resolve, waitTime))
      }
    }
  }

  throw lastError
}

