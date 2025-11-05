"use client"

import { useInstructorAnalytics } from "@/hooks/use-analytics"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen, Video, Users, FileText, TrendingUp } from "lucide-react"
import { LoadingSpinner } from "@/components/loading-spinner"
import { ErrorMessage } from "@/components/error-message"

export function AnalyticsInstructorStats() {
  const { data, isLoading, error } = useInstructorAnalytics()

  if (isLoading) {
    return (
      <div className="grid md:grid-cols-4 gap-6">
        {[1, 2, 3, 4, 5].map((i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div className="h-4 w-24 bg-muted animate-pulse rounded" />
              <div className="h-4 w-4 bg-muted animate-pulse rounded" />
            </CardHeader>
            <CardContent>
              <div className="h-8 w-16 bg-muted animate-pulse rounded mb-2" />
              <div className="h-3 w-32 bg-muted animate-pulse rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (error) {
    return <ErrorMessage message="Failed to load instructor statistics" />
  }

  if (!data) {
    return null
  }

  const stats = [
    {
      title: "My Courses",
      value: data.total_courses,
      description: "Courses created",
      icon: BookOpen,
    },
    {
      title: "Total Lessons",
      value: data.total_lessons,
      description: "Lessons published",
      icon: Video,
    },
    {
      title: "Students",
      value: data.total_students,
      description: "Enrolled students",
      icon: Users,
    },
    {
      title: "Quizzes",
      value: data.total_quizzes,
      description: "Quizzes created",
      icon: FileText,
    },
    {
      title: "Completion Rate",
      value: `${data.completion_rate}%`,
      description: "Student completion",
      icon: TrendingUp,
    },
  ]

  return (
    <div className="grid md:grid-cols-4 gap-6">
      {stats.map((stat) => {
        const Icon = stat.icon
        return (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <Icon className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#7752FE]">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

