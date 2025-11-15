/**
 * Analytics service for collecting and aggregating learning data
 */

import { createClient } from "@/lib/supabase/client"
import { createServerClient } from "@/lib/supabase/server"
import type {
  DashboardStats,
  CourseAnalytics,
  UserAnalytics,
} from "@/lib/types/api"

export class AnalyticsService {
  /**
   * Get dashboard statistics (admin view)
   */
  async getDashboardStats(): Promise<DashboardStats> {
    const supabase = await createServerClient()

    // Get total users
    const { count: totalUsers } = await supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })

    // Get total courses
    const { count: totalCourses } = await supabase
      .from("courses")
      .select("*", { count: "exact", head: true })
      .eq("is_published", true)

    // Get total enrollments
    const { count: totalEnrollments } = await supabase
      .from("course_enrollments")
      .select("*", { count: "exact", head: true })

    // Get total certificates
    const { count: totalCertificates } = await supabase
      .from("certificates")
      .select("*", { count: "exact", head: true })

    // Get active learners (users who logged in in last 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    const { count: activeLearners } = await supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .eq("role", "learner")
      .gte("updated_at", thirtyDaysAgo.toISOString())

    // Calculate completion rate
    const { data: enrollments } = await supabase
      .from("course_enrollments")
      .select("progress_percentage")

    const completedEnrollments =
      enrollments?.filter((e) => e.progress_percentage === 100).length || 0
    const completionRate =
      enrollments && enrollments.length > 0
        ? Math.round((completedEnrollments / enrollments.length) * 100)
        : 0

    return {
      total_users: totalUsers || 0,
      total_courses: totalCourses || 0,
      total_enrollments: totalEnrollments || 0,
      total_certificates: totalCertificates || 0,
      active_learners: activeLearners || 0,
      completion_rate: completionRate,
    }
  }

  /**
   * Get course analytics (instructor view)
   */
  async getCourseAnalytics(courseId: string): Promise<CourseAnalytics | null> {
    const supabase = await createServerClient()

    // Get course details
    const { data: course } = await supabase
      .from("courses")
      .select("*")
      .eq("id", courseId)
      .single()

    if (!course) {
      return null
    }

    // Get total enrollments
    const { count: totalEnrollments } = await supabase
      .from("course_enrollments")
      .select("*", { count: "exact", head: true })
      .eq("course_id", courseId)

    // Get completed enrollments
    const { count: completedEnrollments } = await supabase
      .from("course_enrollments")
      .select("*", { count: "exact", head: true })
      .eq("course_id", courseId)
      .eq("progress_percentage", 100)

    // Get all lessons for this course
    const { data: lessons } = await supabase
      .from("lessons")
      .select("id")
      .eq("course_id", courseId)

    const lessonIds = lessons?.map((l) => l.id) || []

    // Get all quizzes for these lessons
    const { data: quizzes } = await supabase
      .from("quizzes")
      .select("id")
      .in("lesson_id", lessonIds)

    const quizIds = quizzes?.map((q) => q.id) || []

    // Calculate average score
    const { data: quizAttempts } = quizIds.length > 0
      ? await supabase
          .from("quiz_attempts")
          .select("score")
          .in("quiz_id", quizIds)
          .eq("passed", true)
      : { data: null }

    const averageScore =
      quizAttempts && quizAttempts.length > 0
        ? quizAttempts.reduce((sum, attempt) => sum + attempt.score, 0) /
          quizAttempts.length
        : 0

    // Calculate average completion time (in days)
    const { data: completedEnrollmentsData } = await supabase
      .from("course_enrollments")
      .select("enrolled_at, completed_at")
      .eq("course_id", courseId)
      .not("completed_at", "is", null)

    const averageCompletionTime =
      completedEnrollmentsData && completedEnrollmentsData.length > 0
        ? completedEnrollmentsData.reduce((sum, enrollment) => {
            const enrolled = new Date(enrollment.enrolled_at).getTime()
            const completed = new Date(enrollment.completed_at!).getTime()
            const days = (completed - enrolled) / (1000 * 60 * 60 * 24)
            return sum + days
          }, 0) / completedEnrollmentsData.length
        : 0

    // Get popular lessons (by view count - approximated by progress entries)
    const { data: lessonProgress } = lessonIds.length > 0
      ? await supabase
          .from("lesson_progress")
          .select("lesson_id")
          .in("lesson_id", lessonIds)
      : { data: null }

    const lessonViewCounts = new Map<string, number>()
    lessonProgress?.forEach((progress) => {
      const count = lessonViewCounts.get(progress.lesson_id) || 0
      lessonViewCounts.set(progress.lesson_id, count + 1)
    })

    const popularLessons = Array.from(lessonViewCounts.entries())
      .map(([lesson_id, view_count]) => ({ lesson_id, view_count }))
      .sort((a, b) => b.view_count - a.view_count)
      .slice(0, 5)

    return {
      course_id: courseId,
      course,
      total_enrollments: totalEnrollments || 0,
      completed_enrollments: completedEnrollments || 0,
      average_score: Math.round(averageScore * 100) / 100,
      average_completion_time: Math.round(averageCompletionTime * 100) / 100,
      popular_lessons: popularLessons,
    }
  }

  /**
   * Get user analytics (learner view)
   */
  async getUserAnalytics(userId: string): Promise<UserAnalytics | null> {
    const supabase = await createServerClient()

    // Get total enrollments
    const { count: totalEnrollments } = await supabase
      .from("course_enrollments")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)

    // Get completed courses
    const { count: completedCourses } = await supabase
      .from("course_enrollments")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("progress_percentage", 100)

    // Get all quizzes for lessons the user has attempted
    const { data: userLessons } = await supabase
      .from("lesson_progress")
      .select("lesson_id")
      .eq("user_id", userId)

    const userLessonIds = userLessons?.map((l) => l.lesson_id) || []

    // Get quizzes for these lessons
    const { data: userQuizzes } = await supabase
      .from("quizzes")
      .select("id")
      .in("lesson_id", userLessonIds)

    const userQuizIds = userQuizzes?.map((q) => q.id) || []

    // Calculate average score
    const { data: quizAttempts } = await supabase
      .from("quiz_attempts")
      .select("score")
      .eq("user_id", userId)
      .in("quiz_id", userQuizIds.length > 0 ? userQuizIds : [])
      .eq("passed", true)

    const averageScore =
      quizAttempts && quizAttempts.length > 0
        ? quizAttempts.reduce((sum, attempt) => sum + attempt.score, 0) /
          quizAttempts.length
        : 0

    // Calculate total study time (sum of video durations for completed lessons)
    const { data: completedLessons } = await supabase
      .from("lesson_progress")
      .select("lesson_id")
      .eq("user_id", userId)
      .eq("is_completed", true)

    const lessonIds = completedLessons?.map((l) => l.lesson_id) || []
    const { data: lessons } = await supabase
      .from("lessons")
      .select("video_duration_seconds")
      .in("id", lessonIds)

    const totalStudyTime =
      lessons?.reduce(
        (sum, lesson) => sum + (lesson.video_duration_seconds || 0),
        0
      ) || 0

    // Get certificates earned
    const { count: certificatesEarned } = await supabase
      .from("certificates")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)

    return {
      user_id: userId,
      total_enrollments: totalEnrollments || 0,
      completed_courses: completedCourses || 0,
      average_score: Math.round(averageScore * 100) / 100,
      total_study_time: totalStudyTime, // in seconds
      certificates_earned: certificatesEarned || 0,
    }
  }

  /**
   * Get instructor analytics (for a specific instructor)
   */
  async getInstructorAnalytics(instructorId: string) {
    const supabase = await createServerClient()

    // Get instructor's courses
    const { data: courses } = await supabase
      .from("courses")
      .select("id")
      .eq("instructor_id", instructorId)

    const courseIds = courses?.map((c) => c.id) || []

    // Get total students across all courses
    const { count: totalStudents } = await supabase
      .from("course_enrollments")
      .select("*", { count: "exact", head: true })
      .in("course_id", courseIds)

    // Get total lessons
    const { count: totalLessons } = await supabase
      .from("lessons")
      .select("*", { count: "exact", head: true })
      .in("course_id", courseIds)
      .eq("is_published", true)

    // Get all lessons for instructor's courses
    const { data: instructorLessons } = await supabase
      .from("lessons")
      .select("id")
      .in("course_id", courseIds.length > 0 ? courseIds : [])
      .eq("is_published", true)

    const instructorLessonIds = instructorLessons?.map((l) => l.id) || []

    // Get total quizzes
    const { count: totalQuizzes } = await supabase
      .from("quizzes")
      .select("*", { count: "exact", head: true })
      .in("lesson_id", instructorLessonIds.length > 0 ? instructorLessonIds : [])
      .eq("is_published", true)

    // Get course completion rates
    const { data: enrollments } = await supabase
      .from("course_enrollments")
      .select("progress_percentage")
      .in("course_id", courseIds)

    const completedCount =
      enrollments?.filter((e) => e.progress_percentage === 100).length || 0
    const completionRate =
      enrollments && enrollments.length > 0
        ? Math.round((completedCount / enrollments.length) * 100)
        : 0

    return {
      total_courses: courses?.length || 0,
      total_students: totalStudents || 0,
      total_lessons: totalLessons || 0,
      total_quizzes: totalQuizzes || 0,
      completion_rate: completionRate,
    }
  }

  /**
   * Get group analytics (for group admin)
   */
  async getGroupAnalytics(groupId: string) {
    const supabase = await createServerClient()

    // Get group members
    const { data: members } = await supabase
      .from("group_members")
      .select("user_id")
      .eq("group_id", groupId)

    const userIds = members?.map((m) => m.user_id) || []

    if (userIds.length === 0) {
      return {
        total_members: 0,
        total_enrollments: 0,
        completed_courses: 0,
        average_score: 0,
        active_learners: 0,
      }
    }

    // Get total enrollments
    const { count: totalEnrollments } = await supabase
      .from("course_enrollments")
      .select("*", { count: "exact", head: true })
      .in("user_id", userIds)

    // Get completed courses
    const { count: completedCourses } = await supabase
      .from("course_enrollments")
      .select("*", { count: "exact", head: true })
      .in("user_id", userIds)
      .eq("progress_percentage", 100)

    // Get all quiz attempts for group members
    const { data: quizAttempts } = userIds.length > 0
      ? await supabase
          .from("quiz_attempts")
          .select("score")
          .in("user_id", userIds)
          .eq("passed", true)
      : { data: null }

    const averageScore =
      quizAttempts && quizAttempts.length > 0
        ? quizAttempts.reduce((sum, attempt) => sum + attempt.score, 0) /
          quizAttempts.length
        : 0

    // Get active learners (users with progress in last 7 days)
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    const { count: activeLearners } = await supabase
      .from("lesson_progress")
      .select("*", { count: "exact", head: true })
      .in("user_id", userIds)
      .gte("last_accessed_at", sevenDaysAgo.toISOString())

    return {
      total_members: userIds.length,
      total_enrollments: totalEnrollments || 0,
      completed_courses: completedCourses || 0,
      average_score: Math.round(averageScore * 100) / 100,
      active_learners: activeLearners || 0,
    }
  }
}

export const analyticsService = new AnalyticsService()

