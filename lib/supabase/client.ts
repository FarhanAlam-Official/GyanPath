import { createBrowserClient } from "@supabase/ssr"

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          // Only run in browser environment
          if (typeof document === "undefined") {
            return []
          }

          // Parse all cookies from document.cookie
          return document.cookie
            .split("; ")
            .map((cookie) => {
              const [name, ...valueParts] = cookie.split("=")
              return {
                name,
                value: valueParts.join("="),
              }
            })
            .filter((cookie) => cookie.name) // Filter out empty cookies
        },
        setAll(cookiesToSet) {
          // Only run in browser environment
          if (typeof document === "undefined") {
            return
          }

          // Set all cookies in document.cookie
          cookiesToSet.forEach(({ name, value, options }) => {
            let cookie = `${name}=${value}`

            if (options?.maxAge) {
              cookie += `; max-age=${options.maxAge}`
            }
            if (options?.expires) {
              cookie += `; expires=${options.expires.toUTCString()}`
            }
            if (options?.path) {
              cookie += `; path=${options.path}`
            } else {
              cookie += "; path=/"
            }
            if (options?.domain) {
              cookie += `; domain=${options.domain}`
            }
            if (options?.sameSite) {
              cookie += `; samesite=${options.sameSite}`
            }
            if (options?.secure) {
              cookie += "; secure"
            }

            document.cookie = cookie
          })
        },
      },
    }
  )
}

// Create a specialized client for password reset
export function createPasswordResetClient() {
  return createClient() // Use the same client
}
