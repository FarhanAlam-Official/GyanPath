/**
 * Utility functions for managing offline progress
 */

import { db, type OfflineProgress } from "./indexeddb"
import { createClient } from "@/lib/supabase/client"

/**
 * Save progress offline (will sync when online)
 */
export async function saveProgressOffline(
  lessonId: string,
  videoProgressSeconds: number,
  isCompleted: boolean
): Promise<void> {
  try {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      throw new Error("User not authenticated")
    }

    const progress: OfflineProgress = {
      lessonId,
      userId: user.id,
      videoProgressSeconds: Math.floor(videoProgressSeconds),
      isCompleted,
      completedAt: isCompleted ? new Date().toISOString() : undefined,
      lastAccessedAt: new Date().toISOString(),
      synced: false,
    }

    await db.saveProgress(progress)

    // Try to sync immediately if online
    if (navigator.onLine) {
      // Sync will be handled by sync manager
    }
  } catch (error) {
    console.error("Failed to save progress offline:", error)
    throw error
  }
}

