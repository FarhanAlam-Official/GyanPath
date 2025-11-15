"use client"

import { useState, useEffect } from "react"
import { db, type OfflineLesson } from "@/lib/offline/indexeddb"
import { createClient } from "@/lib/supabase/client"

interface UseOfflineLessonOptions {
  lessonId: string
  courseId: string
}

export function useOfflineLesson({ lessonId, courseId }: UseOfflineLessonOptions) {
  const [isCached, setIsCached] = useState(false)
  const [isCaching, setIsCaching] = useState(false)
  const [cachedLesson, setCachedLesson] = useState<OfflineLesson | null>(null)

  useEffect(() => {
    checkIfCached()
  }, [lessonId])

  const checkIfCached = async () => {
    try {
      const lesson = await db.getLesson(lessonId)
      setIsCached(!!lesson)
      setCachedLesson(lesson)
    } catch (error) {
      console.error("Failed to check cache:", error)
    }
  }

  const cacheLesson = async () => {
    setIsCaching(true)
    try {
      const supabase = createClient()

      // Fetch lesson data
      const { data: lesson, error } = await supabase
        .from("lessons")
        .select("*")
        .eq("id", lessonId)
        .single()

      if (error || !lesson) {
        throw new Error("Failed to fetch lesson")
      }

      // Download video if available
      let videoBlob: Blob | undefined
      if (lesson.video_url) {
        try {
          const videoResponse = await fetch(lesson.video_url)
          if (videoResponse.ok) {
            videoBlob = await videoResponse.blob()
          }
        } catch (error) {
          console.warn("Failed to cache video:", error)
        }
      }

      // Download PDF if available
      let pdfBlob: Blob | undefined
      if (lesson.pdf_url) {
        try {
          const pdfResponse = await fetch(lesson.pdf_url)
          if (pdfResponse.ok) {
            pdfBlob = await pdfResponse.blob()
          }
        } catch (error) {
          console.warn("Failed to cache PDF:", error)
        }
      }

      // Save to IndexedDB
      const offlineLesson: OfflineLesson = {
        id: lesson.id,
        courseId: lesson.course_id,
        title: lesson.title,
        titleNe: lesson.title_ne,
        description: lesson.description,
        descriptionNe: lesson.description_ne,
        videoUrl: lesson.video_url,
        pdfUrl: lesson.pdf_url,
        orderIndex: lesson.order_index,
        cachedAt: new Date().toISOString(),
        videoBlob,
        pdfBlob,
      }

      await db.saveLesson(offlineLesson)
      setCachedLesson(offlineLesson)
      setIsCached(true)
    } catch (error) {
      console.error("Failed to cache lesson:", error)
      throw error
    } finally {
      setIsCaching(false)
    }
  }

  const removeCachedLesson = async () => {
    try {
      await db.deleteLesson(lessonId)
      setIsCached(false)
      setCachedLesson(null)
    } catch (error) {
      console.error("Failed to remove cached lesson:", error)
    }
  }

  return {
    isCached,
    isCaching,
    cachedLesson,
    cacheLesson,
    removeCachedLesson,
    refresh: checkIfCached,
  }
}

