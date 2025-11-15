"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { GripVertical, Save, X } from "lucide-react"
import { toast } from "@/lib/utils/toast"
import type { Lesson } from "@/lib/types"

interface LessonReorderProps {
  lessons: Lesson[]
  courseId: string
  onReorder?: (lessons: Lesson[]) => void
}

export function LessonReorder({ lessons: initialLessons, courseId, onReorder }: LessonReorderProps) {
  const [lessons, setLessons] = useState<Lesson[]>(initialLessons)
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  const handleDragStart = (index: number) => {
    setDraggedIndex(index)
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    if (draggedIndex === null || draggedIndex === index) return

    const newLessons = [...lessons]
    const draggedLesson = newLessons[draggedIndex]

    // Remove dragged item
    newLessons.splice(draggedIndex, 1)
    // Insert at new position
    newLessons.splice(index, 0, draggedLesson)

    // Update order_index
    const updatedLessons = newLessons.map((lesson, idx) => ({
      ...lesson,
      order_index: idx + 1,
    }))

    setLessons(updatedLessons)
    setDraggedIndex(index)
    setHasChanges(true)
  }

  const handleDragEnd = () => {
    setDraggedIndex(null)
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      // Update each lesson's order_index
      const updatePromises = lessons.map((lesson, index) =>
        fetch(`/api/courses/${courseId}/lessons/${lesson.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            order_index: index + 1,
          }),
        })
      )

      await Promise.all(updatePromises)
      toast.success("Lessons reordered", "The lesson order has been saved.")
      setHasChanges(false)
      onReorder?.(lessons)
    } catch (error) {
      toast.error("Failed to save order", error instanceof Error ? error.message : "Unknown error")
    } finally {
      setIsSaving(false)
    }
  }

  const handleReset = () => {
    setLessons(initialLessons)
    setHasChanges(false)
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Reorder Lessons</h3>
              <p className="text-sm text-muted-foreground">Drag and drop lessons to reorder them</p>
            </div>
            <div className="flex gap-2">
              {hasChanges && (
                <Button type="button" variant="outline" size="sm" onClick={handleReset} disabled={isSaving}>
                  <X className="w-4 h-4 mr-2" />
                  Reset
                </Button>
              )}
              <Button
                type="button"
                size="sm"
                onClick={handleSave}
                disabled={isSaving || !hasChanges}
                className="bg-[#7752FE] hover:bg-[#190482]"
              >
                <Save className="w-4 h-4 mr-2" />
                {isSaving ? "Saving..." : "Save Order"}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            {lessons.map((lesson, index) => (
              <div
                key={lesson.id}
                draggable
                onDragStart={() => handleDragStart(index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragEnd={handleDragEnd}
                className={`
                  flex items-center gap-3 p-4 border rounded-lg cursor-move
                  transition-all duration-200
                  ${draggedIndex === index ? "opacity-50 bg-gray-100" : "bg-white hover:bg-gray-50"}
                  ${hasChanges ? "border-[#7752FE]" : ""}
                `}
              >
                <GripVertical className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                <div className="w-8 h-8 rounded-full bg-[#C2D9FF] flex items-center justify-center text-[#190482] font-semibold flex-shrink-0">
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium truncate">{lesson.title}</h4>
                  <p className="text-sm text-muted-foreground truncate">{lesson.description || "No description"}</p>
                </div>
                <div className="flex-shrink-0">
                  <span
                    className={`text-xs px-2 py-1 rounded ${
                      lesson.is_published ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {lesson.is_published ? "Published" : "Draft"}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {lessons.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <p>No lessons to reorder</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

