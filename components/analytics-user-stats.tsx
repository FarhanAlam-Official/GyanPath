"use client"

import { useUserAnalytics } from "@/hooks/use-analytics"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen, Award, TrendingUp, Clock } from "lucide-react"
import { LoadingSpinner } from "@/components/loading-spinner"
import { ErrorMessage } from "@/components/error-message"

function formatStudyTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`
  }
  return `${minutes}m`
}

export function AnalyticsUserStats() {
  const { data, isLoading, error } = useUserAnalytics()

  if (isLoading) {
    return (
      <div className="grid md:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
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
    return <ErrorMessage message="Failed to load your statistics" />
  }

  if (!data) {
    return null
  }

  const completionRate =
    data.total_enrollments > 0
      ? Math.round((data.completed_courses / data.total_enrollments) * 100)
      : 0

  const stats = [
    {
      title: "Enrolled Courses",
      value: data.total_enrollments,
      description: "Active courses",
      icon: BookOpen,
    },
    {
      title: "Completed",
      value: data.completed_courses,
      description: "Courses finished",
      icon: Award,
    },
    {
      title: "Progress",
      value: `${completionRate}%`,
      description: "Overall completion",
      icon: TrendingUp,
    },
    {
      title: "Study Time",
      value: formatStudyTime(data.total_study_time),
      description: "Total time learned",
      icon: Clock,
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

