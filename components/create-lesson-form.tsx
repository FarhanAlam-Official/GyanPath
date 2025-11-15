"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
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

interface CreateLessonFormProps {
  courseId: string
  nextOrderIndex: number
}

export function CreateLessonForm({ courseId, nextOrderIndex }: CreateLessonFormProps) {
  const router = useRouter()
  const supabase = createClient()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    title: "",
    title_ne: "",
    description: "",
    description_ne: "",
    video_url: "",
    video_duration_seconds: "",
    pdf_url: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const { error } = await supabase.from("lessons").insert({
        course_id: courseId,
        title: formData.title,
        title_ne: formData.title_ne || null,
        description: formData.description || null,
        description_ne: formData.description_ne || null,
        video_url: formData.video_url || null,
        video_duration_seconds: formData.video_duration_seconds
          ? Number.parseInt(formData.video_duration_seconds)
          : null,
        pdf_url: formData.pdf_url || null,
        order_index: nextOrderIndex,
        is_published: false,
      })

      if (error) throw error

      router.push(`/instructor/courses/${courseId}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create lesson")
    } finally {
      setIsLoading(false)
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

          {error && <p className="text-sm text-red-600 bg-red-50 p-3 rounded">{error}</p>}

          <div className="flex gap-4">
            <Button type="submit" disabled={isLoading} className="bg-[#7752FE] hover:bg-[#190482]">
              {isLoading ? "Creating..." : "Create Lesson"}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.back()} disabled={isLoading}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
