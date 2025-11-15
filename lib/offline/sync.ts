/**
 * Offline sync manager for syncing progress and queue items when online
 */

import { db, type OfflineProgress, type OfflineQueueItem } from "./indexeddb"
import { createClient } from "@/lib/supabase/client"

class SyncManager {
  private isSyncing = false
  private syncInterval: NodeJS.Timeout | null = null

  async syncProgress(): Promise<void> {
    if (this.isSyncing) return

    this.isSyncing = true

    try {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        return
      }

      // Get all unsynced progress
      const unsyncedProgress = await db.getUnsyncedProgress(user.id)

      for (const progress of unsyncedProgress) {
        try {
          // Upsert progress to Supabase
          const { error } = await supabase.from("lesson_progress").upsert(
            {
              lesson_id: progress.lessonId,
              user_id: progress.userId,
              video_progress_seconds: progress.videoProgressSeconds,
              is_completed: progress.isCompleted,
              completed_at: progress.completedAt || null,
              last_accessed_at: progress.lastAccessedAt,
            },
            {
              onConflict: "lesson_id,user_id",
            }
          )

          if (!error) {
            // Mark as synced
            await db.markProgressSynced(progress.lessonId, progress.userId)
          }
        } catch (error) {
          console.error("Failed to sync progress:", error)
        }
      }
    } catch (error) {
      console.error("Sync error:", error)
    } finally {
      this.isSyncing = false
    }
  }

  async syncQueue(): Promise<void> {
    if (this.isSyncing) return

    this.isSyncing = true

    try {
      const queueItems = await db.getQueueItems()

      for (const item of queueItems) {
        // Skip items that have been retried too many times
        if (item.retries > 3) {
          await db.removeQueueItem(item.id)
          continue
        }

        try {
          const supabase = createClient()
          const success = await this.processQueueItem(item, supabase)

          if (success) {
            await db.removeQueueItem(item.id)
          } else {
            await db.incrementQueueRetry(item.id)
          }
        } catch (error) {
          console.error("Failed to process queue item:", error)
          await db.incrementQueueRetry(item.id)
        }
      }
    } catch (error) {
      console.error("Queue sync error:", error)
    } finally {
      this.isSyncing = false
    }
  }

  private async processQueueItem(
    item: OfflineQueueItem,
    supabase: ReturnType<typeof createClient>
  ): Promise<boolean> {
    switch (item.type) {
      case "progress":
        // Already handled by syncProgress
        return true

      case "quiz_attempt":
        // Handle quiz attempt sync
        const quizData = item.data as {
          quiz_id: string
          user_id: string
          score: number
          total_questions: number
          passed: boolean
          time_taken_seconds: number
          started_at: string | null
          answers: Array<{
            question_id: string
            selected_option_id?: string
            is_correct: boolean
          }>
        }

        // Calculate retry cooldown (simplified - would need quiz data)
        const canRetryAfter = null // Would need quiz settings to calculate this

        const { data: attempt, error: attemptError } = await supabase
          .from("quiz_attempts")
          .insert({
            quiz_id: quizData.quiz_id,
            user_id: quizData.user_id,
            score: quizData.score,
            total_questions: quizData.total_questions,
            passed: quizData.passed,
            time_taken_seconds: quizData.time_taken_seconds,
            started_at: quizData.started_at,
            can_retry_after: canRetryAfter,
          })
          .select()
          .single()

        if (attemptError) {
          console.error("Failed to sync quiz attempt:", attemptError)
          return false
        }

        // Save answers
        for (const answer of quizData.answers) {
          const { error: answerError } = await supabase.from("quiz_answers").insert({
            attempt_id: attempt.id,
            question_id: answer.question_id,
            selected_option_id: answer.selected_option_id,
            is_correct: answer.is_correct,
          })

          if (answerError) {
            console.error("Failed to sync quiz answer:", answerError)
          }
        }

        return true

      case "enrollment":
        // Handle enrollment sync
        const enrollmentData = item.data as { course_id: string }
        const { error: enrollmentError } = await supabase.from("course_enrollments").insert({
          course_id: enrollmentData.course_id,
        })

        return !enrollmentError

      default:
        return false
    }
  }

  async syncAll(): Promise<void> {
    if (!navigator.onLine) {
      return
    }

    await Promise.all([this.syncProgress(), this.syncQueue()])
  }

  startAutoSync(intervalMs: number = 30000): void {
    // Sync immediately
    this.syncAll()

    // Then sync at intervals
    this.syncInterval = setInterval(() => {
      if (navigator.onLine) {
        this.syncAll()
      }
    }, intervalMs)

    // Also sync when coming back online
    window.addEventListener("online", () => {
      this.syncAll()
    })
  }

  stopAutoSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval)
      this.syncInterval = null
    }
  }
}

export const syncManager = new SyncManager()

// Auto-start sync when module loads (in browser)
// This will be initialized by useOfflineSync hook

