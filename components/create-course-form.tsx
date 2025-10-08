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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function CreateCourseForm() {
  const router = useRouter()
  const supabase = createClient()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    title: "",
    title_ne: "",
    description: "",
    description_ne: "",
    category: "",
    difficulty_level: "beginner" as const,
    estimated_duration_hours: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error("Not authenticated")

      const { data, error } = await supabase
        .from("courses")
        .insert({
          title: formData.title,
          title_ne: formData.title_ne || null,
          description: formData.description || null,
          description_ne: formData.description_ne || null,
          category: formData.category || null,
          difficulty_level: formData.difficulty_level,
          estimated_duration_hours: formData.estimated_duration_hours
            ? Number.parseInt(formData.estimated_duration_hours)
            : null,
          instructor_id: user.id,
          is_published: false,
        })
        .select()
        .single()

      if (error) throw error

      router.push(`/instructor/courses/${data.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create course")
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

          <div className="space-y-2">
            <Label htmlFor="duration">Estimated Duration (hours)</Label>
            <Input
              id="duration"
              type="number"
              min="1"
              value={formData.estimated_duration_hours}
              onChange={(e) => setFormData({ ...formData, estimated_duration_hours: e.target.value })}
              placeholder="10"
            />
          </div>

          {error && <p className="text-sm text-red-600 bg-red-50 p-3 rounded">{error}</p>}

          <div className="flex gap-4">
            <Button type="submit" disabled={isLoading} className="bg-[#7752FE] hover:bg-[#190482]">
              {isLoading ? "Creating..." : "Create Course"}
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
