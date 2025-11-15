"use client"

import { useQuery } from "@tanstack/react-query"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BookOpen, Clock, BarChart, Sparkles } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import type { Course } from "@/lib/types"
import type { CourseRecommendation } from "@/lib/recommendations/service"

interface CourseRecommendationsProps {
  userId: string
  enrolledCourseIds: string[]
  limit?: number
  title?: string
  showReason?: boolean
}

export function CourseRecommendations({
  userId,
  enrolledCourseIds,
  limit = 6,
  title = "Recommended for You",
  showReason = true,
}: CourseRecommendationsProps) {
  const { data, isLoading, error } = useQuery({
    queryKey: ["course-recommendations", userId],
    queryFn: async () => {
      const response = await fetch(`/api/recommendations?limit=${limit}`)
      if (!response.ok) {
        throw new Error("Failed to load recommendations")
      }
      const result = await response.json()
      return result.recommendations as CourseRecommendation[]
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  })

  const recommendations = data || []

  if (error) {
    return null // Fail silently
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-[#190482]">{title}</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(limit)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="aspect-video bg-muted rounded-lg mb-4" />
                <div className="h-4 bg-muted rounded w-3/4" />
              </CardHeader>
              <CardContent>
                <div className="h-3 bg-muted rounded w-full mb-2" />
                <div className="h-3 bg-muted rounded w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (recommendations.length === 0) {
    return null
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Sparkles className="w-6 h-6 text-[#7752FE]" />
        <h2 className="text-2xl font-bold text-[#190482]">{title}</h2>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {recommendations.map((course: CourseRecommendation) => {
          const isEnrolled = enrolledCourseIds.includes(course.id)
          return (
            <Card key={course.id} className="hover:shadow-lg transition-shadow relative">
              {showReason && course.recommendation_reason && (
                <div className="absolute top-2 right-2">
                  <span className="text-xs bg-[#7752FE]/10 text-[#7752FE] px-2 py-1 rounded-full font-medium">
                    {course.recommendation_reason}
                  </span>
                </div>
              )}
              <CardHeader>
                <div className="relative aspect-video bg-gradient-to-br from-[#190482] to-[#7752FE] rounded-lg mb-4 flex items-center justify-center overflow-hidden">
                  {course.thumbnail_url ? (
                    <Image
                      src={course.thumbnail_url || "/placeholder.svg"}
                      alt={course.title}
                      fill
                      className="object-cover rounded-lg"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  ) : (
                    <BookOpen className="w-12 h-12 text-white" />
                  )}
                </div>
                <CardTitle className="line-clamp-2">{course.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {course.description || "No description"}
                </p>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{course.estimated_duration_hours || "N/A"}h</span>
                  </div>
                  {course.difficulty_level && (
                    <div className="flex items-center gap-1">
                      <BarChart className="w-3 h-3" />
                      <span className="capitalize">{course.difficulty_level}</span>
                    </div>
                  )}
                  {course.category && (
                    <div className="flex items-center gap-1">
                      <span className="px-2 py-0.5 bg-muted rounded text-xs">{course.category}</span>
                    </div>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  By {course.instructor?.full_name || "Unknown"}
                </p>
                <Button
                  asChild
                  className="w-full bg-[#7752FE] hover:bg-[#190482]"
                  disabled={isEnrolled}
                >
                  <Link
                    href={isEnrolled ? `/learner/courses/${course.id}` : `/learner/courses/${course.id}/enroll`}
                  >
                    {isEnrolled ? "View Course" : "Enroll Now"}
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}

