"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { MediaLibrary } from "@/components/media-library"
import { Upload } from "lucide-react"
import { toast } from "@/lib/utils/toast"
import type { Lesson } from "@/lib/types"

interface EditLessonFormProps {
  lesson: Lesson
  courseId: string
}

export function EditLessonForm({ lesson, courseId }: EditLessonFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    title: lesson.title || "",
    title_ne: lesson.title_ne || "",
    description: lesson.description || "",
    description_ne: lesson.description_ne || "",
    video_url: lesson.video_url || "",
    video_duration_seconds: lesson.video_duration_seconds?.toString() || "",
    pdf_url: lesson.pdf_url || "",
    order_index: lesson.order_index?.toString() || "",
  })

  useEffect(() => {
    // Update form data when lesson prop changes
    setFormData({
      title: lesson.title || "",
      title_ne: lesson.title_ne || "",
      description: lesson.description || "",
      description_ne: lesson.description_ne || "",
      video_url: lesson.video_url || "",
      video_duration_seconds: lesson.video_duration_seconds?.toString() || "",
      pdf_url: lesson.pdf_url || "",
      order_index: lesson.order_index?.toString() || "",
    })
  }, [lesson])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/courses/${courseId}/lessons/${lesson.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: formData.title,
          title_ne: formData.title_ne || null,
          description: formData.description || null,
          description_ne: formData.description_ne || null,
          video_url: formData.video_url || null,
          video_duration_seconds: formData.video_duration_seconds
            ? Number.parseInt(formData.video_duration_seconds)
            : null,
          pdf_url: formData.pdf_url || null,
          order_index: formData.order_index ? Number.parseInt(formData.order_index) : null,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to update lesson")
      }

      toast.success("Lesson updated successfully", "Your changes have been saved.")
      router.push(`/instructor/courses/${courseId}`)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to update lesson"
      setError(errorMessage)
      toast.error("Failed to update lesson", errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    setError(null)

    try {
      const response = await fetch(`/api/courses/${courseId}/lessons/${lesson.id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to delete lesson")
      }

      toast.success("Lesson deleted successfully", "The lesson has been removed from the course.")
      router.push(`/instructor/courses/${courseId}`)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to delete lesson"
      setError(errorMessage)
      toast.error("Failed to delete lesson", errorMessage)
      setIsDeleting(false)
    }
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Lesson Title (English) *</Label>
            <Input
              id="title"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Introduction to HTML"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="title_ne">Lesson Title (Nepali)</Label>
            <Input
              id="title_ne"
              value={formData.title_ne}
              onChange={(e) => setFormData({ ...formData, title_ne: e.target.value })}
              placeholder="HTML को परिचय"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (English)</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="What will students learn in this lesson..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description_ne">Description (Nepali)</Label>
            <Textarea
              id="description_ne"
              value={formData.description_ne}
              onChange={(e) => setFormData({ ...formData, description_ne: e.target.value })}
              placeholder="यस पाठमा विद्यार्थीहरूले के सिक्नेछन्..."
              rows={3}
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="video_url">Video URL</Label>
              <div className="flex gap-2">
                <Input
                  id="video_url"
                  type="url"
                  value={formData.video_url}
                  onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
                  placeholder="https://example.com/video.mp4"
                />
                <Dialog>
                  <DialogTrigger asChild>
                    <Button type="button" variant="outline" size="icon">
                      <Upload className="w-4 h-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Upload Video</DialogTitle>
                      <DialogDescription>Upload a video file or paste a URL for your lesson video</DialogDescription>
                    </DialogHeader>
                    <MediaLibrary
                      onFileSelect={(url, type) => {
                        if (type === "video") {
                          setFormData({ ...formData, video_url: url })
                          toast.success("Video selected", "The video URL has been added to the form.")
                        }
                      }}
                      selectedFileUrl={formData.video_url}
                    />
                  </DialogContent>
                </Dialog>
              </div>
              <p className="text-xs text-muted-foreground">Upload your video to Supabase Storage or provide a URL</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration">Video Duration (seconds)</Label>
              <Input
                id="duration"
                type="number"
                min="1"
                value={formData.video_duration_seconds}
                onChange={(e) => setFormData({ ...formData, video_duration_seconds: e.target.value })}
                placeholder="300"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="pdf_url">PDF URL</Label>
            <div className="flex gap-2">
              <Input
                id="pdf_url"
                type="url"
                value={formData.pdf_url}
                onChange={(e) => setFormData({ ...formData, pdf_url: e.target.value })}
                placeholder="https://example.com/document.pdf"
              />
              <Dialog>
                <DialogTrigger asChild>
                  <Button type="button" variant="outline" size="icon">
                    <Upload className="w-4 h-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Upload PDF</DialogTitle>
                    <DialogDescription>Upload a PDF file or paste a URL for your lesson document</DialogDescription>
                  </DialogHeader>
                  <MediaLibrary
                    onFileSelect={(url, type) => {
                      if (type === "pdf") {
                        setFormData({ ...formData, pdf_url: url })
                        toast.success("PDF selected", "The PDF URL has been added to the form.")
                      }
                    }}
                    selectedFileUrl={formData.pdf_url}
                  />
                </DialogContent>
              </Dialog>
            </div>
            <p className="text-xs text-muted-foreground">Upload your PDF to Supabase Storage or provide a URL</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="order_index">Order Index</Label>
            <Input
              id="order_index"
              type="number"
              min="1"
              value={formData.order_index}
              onChange={(e) => setFormData({ ...formData, order_index: e.target.value })}
              placeholder="1"
            />
            <p className="text-xs text-muted-foreground">The position of this lesson in the course (1 = first lesson)</p>
          </div>

          {error && <p className="text-sm text-red-600 bg-red-50 p-3 rounded">{error}</p>}

          <div className="flex gap-4 justify-between">
            <div className="flex gap-4">
              <Button type="submit" disabled={isLoading || isDeleting} className="bg-[#7752FE] hover:bg-[#190482]">
                {isLoading ? "Updating..." : "Update Lesson"}
              </Button>
              <Button type="button" variant="outline" onClick={() => router.back()} disabled={isLoading || isDeleting}>
                Cancel
              </Button>
            </div>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button type="button" variant="destructive" disabled={isLoading || isDeleting || lesson.is_published}>
                  {isDeleting ? "Deleting..." : "Delete Lesson"}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete the lesson "{lesson.title}". Published
                    lessons cannot be deleted.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

