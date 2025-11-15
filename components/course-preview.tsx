"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Video, FileText, Clock, User, BookOpen } from "lucide-react"
import Link from "next/link"
import type { Course, Lesson } from "@/lib/types"

interface CoursePreviewProps {
  course: Course
  lessons?: Lesson[]
}

export function CoursePreview({ course, lessons = [] }: CoursePreviewProps) {
  const publishedLessons = lessons.filter((l) => l.is_published)
  const totalDuration = publishedLessons.reduce((acc, lesson) => {
    return acc + (lesson.video_duration_seconds || 0)
  }, 0)

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    if (hours > 0) {
      return `${hours}h ${minutes}m`
    }
    return `${minutes}m`
  }

  return (
    <div className="space-y-6">
      {/* Course Header */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            {course.thumbnail_url && (
              <div className="aspect-video w-full rounded-lg overflow-hidden bg-gray-100">
                <img
                  src={course.thumbnail_url}
                  alt={course.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div>
              <h1 className="text-3xl font-bold text-[#190482] mb-2">{course.title}</h1>
              {course.title_ne && (
                <h2 className="text-xl text-muted-foreground mb-4">{course.title_ne}</h2>
              )}
              <div className="flex flex-wrap gap-2 mb-4">
                {course.difficulty_level && (
                  <Badge variant="outline" className="capitalize">
                    {course.difficulty_level}
                  </Badge>
                )}
                {course.category && (
                  <Badge variant="outline">{course.category}</Badge>
                )}
                <Badge variant={course.is_published ? "default" : "secondary"}>
                  {course.is_published ? "Published" : "Draft"}
                </Badge>
              </div>
              {course.description && (
                <p className="text-muted-foreground whitespace-pre-line">{course.description}</p>
              )}
              {course.description_ne && (
                <p className="text-muted-foreground mt-2 whitespace-pre-line">{course.description_ne}</p>
              )}
            </div>

            {/* Course Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-[#7752FE]" />
                <div>
                  <p className="text-sm font-medium">{publishedLessons.length}</p>
                  <p className="text-xs text-muted-foreground">Lessons</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-[#7752FE]" />
                <div>
                  <p className="text-sm font-medium">{formatDuration(totalDuration)}</p>
                  <p className="text-xs text-muted-foreground">Duration</p>
                </div>
              </div>
              {course.estimated_duration_hours && (
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-[#7752FE]" />
                  <div>
                    <p className="text-sm font-medium">{course.estimated_duration_hours}h</p>
                    <p className="text-xs text-muted-foreground">Estimated</p>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-2">
                <User className="w-5 h-5 text-[#7752FE]" />
                <div>
                  <p className="text-sm font-medium">0</p>
                  <p className="text-xs text-muted-foreground">Students</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lessons List */}
      <Card>
        <CardHeader>
          <CardTitle>Course Content</CardTitle>
        </CardHeader>
        <CardContent>
          {publishedLessons.length > 0 ? (
            <div className="space-y-3">
              {publishedLessons.map((lesson, index) => (
                <div
                  key={lesson.id}
                  className="flex items-center gap-4 p-4 border rounded-lg hover:bg-accent transition-colors"
                >
                  <div className="w-10 h-10 rounded-full bg-[#C2D9FF] flex items-center justify-center text-[#190482] font-semibold flex-shrink-0">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold">{lesson.title}</h3>
                    {lesson.title_ne && (
                      <p className="text-sm text-muted-foreground">{lesson.title_ne}</p>
                    )}
                    {lesson.description && (
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{lesson.description}</p>
                    )}
                    <div className="flex items-center gap-4 mt-2">
                      {lesson.video_url && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Video className="w-4 h-4" />
                          <span>Video</span>
                        </div>
                      )}
                      {lesson.pdf_url && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <FileText className="w-4 h-4" />
                          <span>PDF</span>
                        </div>
                      )}
                      {lesson.video_duration_seconds && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="w-4 h-4" />
                          <span>{formatDuration(lesson.video_duration_seconds)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No published lessons yet</p>
              <p className="text-sm">Publish lessons to make them visible to learners</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Preview Note */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <p className="text-sm text-blue-800">
            <strong>Preview Mode:</strong> This is how your course will appear to learners. Make sure all content is
            complete and published before making the course available.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

