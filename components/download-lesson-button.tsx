"use client"

import { Button } from "@/components/ui/button"
import { Download, Check, Trash2 } from "lucide-react"
import { useOfflineLesson } from "@/hooks/use-offline-lesson"
import { toast } from "@/lib/utils/toast"

interface DownloadLessonButtonProps {
  lessonId: string
  courseId: string
}

export function DownloadLessonButton({ lessonId, courseId }: DownloadLessonButtonProps) {
  const { isCached, isCaching, cacheLesson, removeCachedLesson } = useOfflineLesson({
    lessonId,
    courseId,
  })

  const handleDownload = async () => {
    try {
      await cacheLesson()
      toast.success("Lesson cached", "This lesson is now available offline")
    } catch (error) {
      toast.error("Download failed", "Failed to cache lesson for offline access")
    }
  }

  const handleRemove = async () => {
    try {
      await removeCachedLesson()
      toast.success("Lesson removed", "Lesson has been removed from offline storage")
    } catch (error) {
      toast.error("Failed to remove", "Failed to remove lesson from offline storage")
    }
  }

  if (isCached) {
    return (
      <Button onClick={handleRemove} variant="outline" size="sm">
        <Trash2 className="w-4 h-4 mr-2" />
        Remove from Offline
      </Button>
    )
  }

  return (
    <Button onClick={handleDownload} disabled={isCaching} variant="outline" size="sm">
      <Download className="w-4 h-4 mr-2" />
      {isCaching ? "Caching..." : "Download for Offline"}
    </Button>
  )
}
