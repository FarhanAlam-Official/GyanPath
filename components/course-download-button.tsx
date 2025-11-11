"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Download, CheckCircle, Loader2 } from "lucide-react"
import { toast } from "@/lib/utils/toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"
import { createClient } from "@/lib/supabase/client"
import { db } from "@/lib/offline/indexeddb"

interface CourseDownloadButtonProps {
  courseId: string
  courseTitle: string
}

export function CourseDownloadButton({ courseId, courseTitle }: CourseDownloadButtonProps) {
  const [isDownloading, setIsDownloading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [isDownloaded, setIsDownloaded] = useState(false)
  const [isOpen, setIsOpen] = useState(false)

  const checkIfDownloaded = async () => {
    try {
      const course = await db.getCourse(courseId)
      setIsDownloaded(!!course)
    } catch (error) {
      setIsDownloaded(false)
    }
  }

  const handleDownload = async () => {
    setIsDownloading(true)
    setProgress(0)

    try {
      const supabase = createClient()

      // Fetch course data
      const { data: course, error: courseError } = await supabase
        .from("courses")
        .select("*")
        .eq("id", courseId)
        .single()

      if (courseError || !course) {
        throw new Error("Failed to fetch course")
      }

      setProgress(10)

      // Fetch lessons
      const { data: lessons, error: lessonsError } = await supabase
        .from("lessons")
        .select("*")
        .eq("course_id", courseId)
        .eq("is_published", true)
        .order("order_index", { ascending: true })

      if (lessonsError) {
        throw new Error("Failed to fetch lessons")
      }

      setProgress(20)

      // Download each lesson
      const totalLessons = lessons?.length || 0
      let completedLessons = 0

      for (const lesson of lessons || []) {
        try {
          // Download video if available
          let videoBlob: Blob | undefined
          if (lesson.video_url) {
            try {
              const videoResponse = await fetch(lesson.video_url)
              if (videoResponse.ok) {
                videoBlob = await videoResponse.blob()
              }
            } catch (error) {
              console.warn(`Failed to cache video for lesson ${lesson.id}:`, error)
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
              console.warn(`Failed to cache PDF for lesson ${lesson.id}:`, error)
            }
          }

          // Save lesson to IndexedDB
          await db.saveLesson({
            id: lesson.id,
            courseId: lesson.course_id,
            title: lesson.title,
            titleNe: lesson.title_ne || "",
            description: lesson.description || "",
            descriptionNe: lesson.description_ne || "",
            videoUrl: lesson.video_url || "",
            pdfUrl: lesson.pdf_url || "",
            orderIndex: lesson.order_index,
            cachedAt: new Date().toISOString(),
            videoBlob,
            pdfBlob,
          })

          completedLessons++
          setProgress(20 + (completedLessons / totalLessons) * 70)
        } catch (error) {
          console.error(`Failed to download lesson ${lesson.id}:`, error)
        }
      }

      // Save course metadata
      await db.saveCourse({
        id: course.id,
        title: course.title,
        titleNe: course.title_ne || "",
        description: course.description || "",
        descriptionNe: course.description_ne || "",
        thumbnailUrl: course.thumbnail_url || "",
        instructorId: course.instructor_id,
        cachedAt: new Date().toISOString(),
      })

      setProgress(100)
      setIsDownloaded(true)
      toast.success("Course downloaded", `${courseTitle} is now available offline`)
      setIsOpen(false)
    } catch (error) {
      toast.error("Download failed", error instanceof Error ? error.message : "Unknown error")
    } finally {
      setIsDownloading(false)
      setProgress(0)
    }
  }

  const handleRemove = async () => {
    try {
      // Remove all lessons for this course
      const lessons = await db.getAllLessons()
      const courseLessons = lessons.filter((l) => l.courseId === courseId)
      for (const lesson of courseLessons) {
        await db.deleteLesson(lesson.id)
      }

      // Remove course
      await db.deleteCourse(courseId)
      setIsDownloaded(false)
      toast.success("Course removed", "Course has been removed from offline storage")
    } catch (error) {
      toast.error("Failed to remove", "Failed to remove course from offline storage")
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild onClick={checkIfDownloaded}>
        {isDownloaded ? (
          <Button variant="outline" size="sm" onClick={handleRemove}>
            <CheckCircle className="w-4 h-4 mr-2" />
            Downloaded
          </Button>
        ) : (
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Download Course
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Download Course for Offline</DialogTitle>
          <DialogDescription>
            Download {courseTitle} and all its lessons for offline viewing. This may take a few minutes depending on
            the course size.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          {isDownloading ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Downloading course content...</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} />
              <p className="text-xs text-muted-foreground">
                Please keep this window open until download completes.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                This will download all lessons, videos, and PDFs for offline access. Make sure you have enough storage
                space.
              </p>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleDownload} className="bg-[#7752FE] hover:bg-[#190482]">
                  <Download className="w-4 h-4 mr-2" />
                  Start Download
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

