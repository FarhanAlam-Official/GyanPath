import { createBrowserClient } from "@supabase/ssr"

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        flowType: "pkce",
        detectSessionInUrl: true,
        persistSession: true,
        storage: typeof window !== "undefined" ? window.localStorage : undefined,
        storageKey: "sb-auth-token",
        autoRefreshToken: true,
        debug: process.env.NODE_ENV === "development",
      },
    }
  )
}

// Create a specialized client for password reset that doesn't use PKCE
export function createPasswordResetClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        flowType: "pkce", // Keep PKCE but handle recovery manually
        detectSessionInUrl: true, // Allow detection but handle recovery differently
        persistSession: true,
        storage: typeof window !== "undefined" ? window.localStorage : undefined,
        storageKey: "sb-auth-token", // Use same storage key
        autoRefreshToken: true,
      },
    }
  )
}
