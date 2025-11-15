/**
 * Session Store Management
 * Handles persistent sessions with configurable duration (30 days for remember me)
 */

export const SESSION_CONFIG = {
  DEFAULT_DURATION: 60 * 60, // 1 hour in seconds
  REMEMBER_ME_DURATION: 30 * 24 * 60 * 60, // 30 days in seconds
  STORAGE_KEY: 'session-preference',
} as const

export type SessionDuration = 'default' | 'remember_me'

/**
 * Session preference stored in localStorage
 */
interface SessionPreference {
  rememberMe: boolean
  duration: number
  timestamp: number
}

/**
 * Get the stored session preference
 */
export function getSessionPreference(): SessionPreference | null {
  if (typeof window === 'undefined') return null
  
  try {
    const stored = localStorage.getItem(SESSION_CONFIG.STORAGE_KEY)
    if (!stored) return null
    
    return JSON.parse(stored) as SessionPreference
  } catch (error) {
    console.error('Error reading session preference:', error)
    return null
  }
}

/**
 * Set the session preference
 */
export function setSessionPreference(rememberMe: boolean): void {
  if (typeof window === 'undefined') return
  
  const preference: SessionPreference = {
    rememberMe,
    duration: rememberMe 
      ? SESSION_CONFIG.REMEMBER_ME_DURATION 
      : SESSION_CONFIG.DEFAULT_DURATION,
    timestamp: Date.now(),
  }
  
  try {
    localStorage.setItem(SESSION_CONFIG.STORAGE_KEY, JSON.stringify(preference))
  } catch (error) {
    console.error('Error saving session preference:', error)
  }
}

/**
 * Clear the session preference
 */
export function clearSessionPreference(): void {
  if (typeof window === 'undefined') return
  
  try {
    localStorage.removeItem(SESSION_CONFIG.STORAGE_KEY)
  } catch (error) {
    console.error('Error clearing session preference:', error)
  }
}

/**
 * Get cookie options based on remember me preference
 */
export function getCookieOptions(rememberMe: boolean) {
  const maxAge = rememberMe 
    ? SESSION_CONFIG.REMEMBER_ME_DURATION 
    : SESSION_CONFIG.DEFAULT_DURATION

  return {
    maxAge,
    path: '/',
    sameSite: 'lax' as const,
    secure: process.env.NODE_ENV === 'production',
    httpOnly: false, // Needs to be false for client-side access
  }
}

/**
 * Get the session duration in seconds
 */
export function getSessionDuration(rememberMe: boolean): number {
  return rememberMe 
    ? SESSION_CONFIG.REMEMBER_ME_DURATION 
    : SESSION_CONFIG.DEFAULT_DURATION
}

/**
 * Check if session preference is still valid (not expired)
 */
export function isSessionPreferenceValid(preference: SessionPreference | null): boolean {
  if (!preference) return false
  
  const now = Date.now()
  const elapsed = now - preference.timestamp
  const maxDuration = preference.duration * 1000 // Convert to milliseconds
  
  return elapsed < maxDuration
}
