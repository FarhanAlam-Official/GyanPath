"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Download, Check } from "lucide-react"

interface DownloadLessonButtonProps {
  lessonId: string
  videoUrl?: string
  pdfUrl?: string
}

export function DownloadLessonButton({ lessonId, videoUrl, pdfUrl }: DownloadLessonButtonProps) {
  const [isDownloading, setIsDownloading] = useState(false)
  const [isDownloaded, setIsDownloaded] = useState(false)

  const handleDownload = async () => {
    setIsDownloading(true)

    try {
      const cache = await caches.open("gyanpath-v1")

      // Download video
      if (videoUrl) {
        const videoResponse = await fetch(videoUrl)
        await cache.put(videoUrl, videoResponse)
      }

      // Download PDF
      if (pdfUrl) {
        const pdfResponse = await fetch(pdfUrl)
        await cache.put(pdfUrl, pdfResponse)
      }

      // Store lesson metadata
      localStorage.setItem(`lesson-${lessonId}-downloaded`, "true")

      setIsDownloaded(true)
    } catch (error) {
      console.error("[v0] Failed to download lesson:", error)
    } finally {
      setIsDownloading(false)
    }
  }

  // Check if already downloaded
  useState(() => {
    const downloaded = localStorage.getItem(`lesson-${lessonId}-downloaded`)
    if (downloaded) {
      setIsDownloaded(true)
    }
  })

  if (isDownloaded) {
    return (
      <Button variant="outline" size="sm" disabled>
        <Check className="w-4 h-4 mr-2" />
        Downloaded
      </Button>
    )
  }

  return (
    <Button onClick={handleDownload} disabled={isDownloading} variant="outline" size="sm">
      <Download className="w-4 h-4 mr-2" />
      {isDownloading ? "Downloading..." : "Download for Offline"}
    </Button>
  )
}
