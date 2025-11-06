"use client"

import { useQuery } from "@tanstack/react-query"
import type {
  DashboardStats,
  CourseAnalytics,
  UserAnalytics,
} from "@/lib/types/api"

export function useDashboardStats() {
  return useQuery<DashboardStats>({
    queryKey: ["analytics", "dashboard"],
    queryFn: async () => {
      const response = await fetch("/api/analytics/dashboard")
      if (!response.ok) {
        throw new Error("Failed to fetch dashboard stats")
      }
      return response.json()
    },
  })
}

export function useCourseAnalytics(courseId: string) {
  return useQuery<CourseAnalytics>({
    queryKey: ["analytics", "course", courseId],
    queryFn: async () => {
      const response = await fetch(`/api/analytics/course/${courseId}`)
      if (!response.ok) {
        throw new Error("Failed to fetch course analytics")
      }
      return response.json()
    },
    enabled: !!courseId,
  })
}

export function useUserAnalytics() {
  return useQuery<UserAnalytics>({
    queryKey: ["analytics", "user"],
    queryFn: async () => {
      const response = await fetch("/api/analytics/user")
      if (!response.ok) {
        throw new Error("Failed to fetch user analytics")
      }
      return response.json()
    },
  })
}

export function useInstructorAnalytics() {
  return useQuery({
    queryKey: ["analytics", "instructor"],
    queryFn: async () => {
      const response = await fetch("/api/analytics/instructor")
      if (!response.ok) {
        throw new Error("Failed to fetch instructor analytics")
      }
      return response.json()
    },
  })
}

export function useGroupAnalytics(groupId: string) {
  return useQuery({
    queryKey: ["analytics", "group", groupId],
    queryFn: async () => {
      const response = await fetch(`/api/analytics/group/${groupId}`)
      if (!response.ok) {
        throw new Error("Failed to fetch group analytics")
      }
      return response.json()
    },
    enabled: !!groupId,
  })
}

