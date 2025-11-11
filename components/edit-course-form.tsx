"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
import type { Course } from "@/lib/types"

interface EditCourseFormProps {
  course: Course
}

export function EditCourseForm({ course }: EditCourseFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    title: course.title || "",
    title_ne: course.title_ne || "",
    description: course.description || "",
    description_ne: course.description_ne || "",
    category: course.category || "",
    difficulty_level: (course.difficulty_level as "beginner" | "intermediate" | "advanced") || "beginner",
    estimated_duration_hours: course.estimated_duration_hours?.toString() || "",
    thumbnail_url: course.thumbnail_url || "",
  })

  useEffect(() => {
    // Update form data when course prop changes
    setFormData({
      title: course.title || "",
      title_ne: course.title_ne || "",
      description: course.description || "",
      description_ne: course.description_ne || "",
      category: course.category || "",
      difficulty_level: (course.difficulty_level as "beginner" | "intermediate" | "advanced") || "beginner",
      estimated_duration_hours: course.estimated_duration_hours?.toString() || "",
      thumbnail_url: course.thumbnail_url || "",
    })
  }, [course])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/courses/${course.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: formData.title,
          title_ne: formData.title_ne || null,
          description: formData.description || null,
          description_ne: formData.description_ne || null,
          category: formData.category || null,
          difficulty_level: formData.difficulty_level,
          estimated_duration_hours: formData.estimated_duration_hours
            ? Number.parseFloat(formData.estimated_duration_hours)
            : null,
          thumbnail_url: formData.thumbnail_url || null,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to update course")
      }

      toast.success("Course updated successfully", "Your changes have been saved.")
      router.push(`/instructor/courses/${course.id}`)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to update course"
      setError(errorMessage)
      toast.error("Failed to update course", errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Course Title (English) *</Label>
            <Input
              id="title"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Introduction to Web Development"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="title_ne">Course Title (Nepali)</Label>
            <Input
              id="title_ne"
              value={formData.title_ne}
              onChange={(e) => setFormData({ ...formData, title_ne: e.target.value })}
              placeholder="वेब विकासको परिचय"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (English)</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe what students will learn..."
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description_ne">Description (Nepali)</Label>
            <Textarea
              id="description_ne"
              value={formData.description_ne}
              onChange={(e) => setFormData({ ...formData, description_ne: e.target.value })}
              placeholder="विद्यार्थीहरूले के सिक्नेछन् वर्णन गर्नुहोस्..."
              rows={4}
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                placeholder="e.g., Technology, Business"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="difficulty">Difficulty Level</Label>
              <Select
                value={formData.difficulty_level}
                onValueChange={(value: "beginner" | "intermediate" | "advanced") =>
                  setFormData({ ...formData, difficulty_level: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="duration">Estimated Duration (hours)</Label>
              <Input
                id="duration"
                type="number"
                min="0.5"
                step="0.5"
                value={formData.estimated_duration_hours}
                onChange={(e) => setFormData({ ...formData, estimated_duration_hours: e.target.value })}
                placeholder="10"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="thumbnail_url">Thumbnail URL</Label>
              <div className="flex gap-2">
                <Input
                  id="thumbnail_url"
                  type="url"
                  value={formData.thumbnail_url}
                  onChange={(e) => setFormData({ ...formData, thumbnail_url: e.target.value })}
                  placeholder="https://example.com/image.jpg"
                />
                <Dialog>
                  <DialogTrigger asChild>
                    <Button type="button" variant="outline" size="icon">
                      <Upload className="w-4 h-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Upload Thumbnail</DialogTitle>
                      <DialogDescription>Upload an image or paste a URL for your course thumbnail</DialogDescription>
                    </DialogHeader>
                    <MediaLibrary
                      onFileSelect={(url, type) => {
                        if (type === "image") {
                          setFormData({ ...formData, thumbnail_url: url })
                          toast.success("Thumbnail selected", "The image URL has been added to the form.")
                        }
                      }}
                      selectedFileUrl={formData.thumbnail_url}
                    />
                  </DialogContent>
                </Dialog>
              </div>
              {formData.thumbnail_url && (
                <div className="mt-2">
                  <img
                    src={formData.thumbnail_url}
                    alt="Thumbnail preview"
                    className="w-32 h-20 object-cover rounded border"
                    onError={(e) => {
                      e.currentTarget.style.display = "none"
                    }}
                  />
                </div>
              )}
            </div>
          </div>

          {error && <p className="text-sm text-red-600 bg-red-50 p-3 rounded">{error}</p>}

          <div className="flex gap-4">
            <Button type="submit" disabled={isLoading} className="bg-[#7752FE] hover:bg-[#190482]">
              {isLoading ? "Updating..." : "Update Course"}
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

