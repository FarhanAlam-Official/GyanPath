"use client"

import { useGroupAnalytics } from "@/hooks/use-analytics"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, BookOpen, Award, TrendingUp, UserCheck } from "lucide-react"
import { LoadingSpinner } from "@/components/loading-spinner"
import { ErrorMessage } from "@/components/error-message"

interface GroupAnalyticsStatsProps {
  groupId: string
}

export function GroupAnalyticsStats({ groupId }: GroupAnalyticsStatsProps) {
  const { data, isLoading, error } = useGroupAnalytics(groupId)

  if (isLoading) {
    return (
      <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-6">
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
    return <ErrorMessage message="Failed to load group statistics" />
  }

  if (!data) {
    return null
  }

  const stats = [
    {
      title: "Total Members",
      value: data.total_members,
      description: "Group members",
      icon: Users,
    },
    {
      title: "Total Enrollments",
      value: data.total_enrollments,
      description: "Course enrollments",
      icon: BookOpen,
    },
    {
      title: "Completed Courses",
      value: data.completed_courses,
      description: "Courses finished",
      icon: Award,
    },
    {
      title: "Average Score",
      value: `${data.average_score}%`,
      description: "Quiz performance",
      icon: TrendingUp,
    },
    {
      title: "Active Learners",
      value: data.active_learners,
      description: "Last 7 days",
      icon: UserCheck,
    },
  ]

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-6">
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

