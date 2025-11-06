import { createServerClient } from "@/lib/supabase/server"
import type { Course, DifficultyLevel } from "@/lib/types"

export interface CourseRecommendation extends Course {
  instructor: {
    id: string
    full_name: string
    email: string
  }
  recommendation_score: number
  recommendation_reason: string
}

export class RecommendationService {
  /**
   * Get personalized course recommendations for a user
   * Based on:
   * - User's enrolled courses and their categories/difficulties
   * - User's completed courses
   * - Popular courses in similar categories
   * - Next-level difficulty progression
   */
  async getRecommendations(userId: string, limit: number = 6): Promise<CourseRecommendation[]> {
    const supabase = await createServerClient()

    // Get user's enrolled courses with their details
    const { data: enrollments } = await supabase
      .from("course_enrollments")
      .select(
        `
        *,
        course:courses(*)
      `,
      )
      .eq("user_id", userId)

    const enrolledCourses = (enrollments?.map((e) => e.course) || []) as Course[]
    const enrolledCourseIds = new Set(enrolledCourses.map((c) => c.id))

    // Analyze user preferences
    const userCategories = this.extractCategories(enrolledCourses)
    const userDifficulties = this.extractDifficulties(enrolledCourses)
    const completedCourses = enrollments?.filter((e) => e.progress_percentage === 100) || []
    const completedCourseIds = new Set(completedCourses.map((e) => e.course_id))

    // Get all published courses
    const { data: allCourses } = await supabase
      .from("courses")
      .select(
        `
        *,
        instructor:profiles!courses_instructor_id_fkey(id, full_name, email)
      `,
      )
      .eq("is_published", true)

    if (!allCourses || allCourses.length === 0) {
      return []
    }

    // Filter out already enrolled courses
    const availableCourses = allCourses.filter((course) => !enrolledCourseIds.has(course.id))

    // Calculate recommendation scores for each course
    const recommendations: CourseRecommendation[] = availableCourses
      .map((course) => {
        const score = this.calculateRecommendationScore(
          course as Course & { instructor: { id: string; full_name: string; email: string } },
          {
            userCategories,
            userDifficulties,
            completedCourseIds,
            enrolledCourses,
          },
        )
        return {
          ...course,
          recommendation_score: score.score,
          recommendation_reason: score.reason,
        } as CourseRecommendation
      })
      .filter((rec) => rec.recommendation_score > 0)
      .sort((a, b) => b.recommendation_score - a.recommendation_score)
      .slice(0, limit)

    return recommendations
  }

  /**
   * Extract unique categories from user's courses
   */
  private extractCategories(courses: Course[]): string[] {
    const categories = courses
      .map((c) => c.category)
      .filter((cat): cat is string => Boolean(cat))
    return Array.from(new Set(categories))
  }

  /**
   * Extract difficulty levels from user's courses
   */
  private extractDifficulties(courses: Course[]): DifficultyLevel[] {
    const difficulties = courses
      .map((c) => c.difficulty_level)
      .filter((diff): diff is DifficultyLevel => Boolean(diff))
    return Array.from(new Set(difficulties))
  }

  /**
   * Calculate recommendation score for a course
   */
  private calculateRecommendationScore(
    course: Course & { instructor: { id: string; full_name: string; email: string } },
    context: {
      userCategories: string[]
      userDifficulties: DifficultyLevel[]
      completedCourseIds: Set<string>
      enrolledCourses: Course[]
    },
  ): { score: number; reason: string } {
    let score = 0
    const reasons: string[] = []

    // Category match (high weight)
    if (course.category && context.userCategories.includes(course.category)) {
      score += 30
      reasons.push(`Matches your interest in ${course.category}`)
    }

    // Difficulty progression
    if (course.difficulty_level) {
      if (context.userDifficulties.includes(course.difficulty_level)) {
        score += 20
        reasons.push(`Matches your preferred difficulty level`)
      } else if (this.isNextLevel(course.difficulty_level, context.userDifficulties)) {
        score += 25
        reasons.push(`Perfect next step in your learning journey`)
      }
    }

    // If user has completed courses, prioritize courses in same category with next difficulty
    if (context.completedCourseIds.size > 0) {
      const completedCategories = context.enrolledCourses
        .filter((c) => context.completedCourseIds.has(c.id))
        .map((c) => c.category)
        .filter(Boolean)

      if (course.category && completedCategories.includes(course.category)) {
        if (this.isNextLevel(course.difficulty_level, context.userDifficulties)) {
          score += 15
          reasons.push(`Build on your completed ${course.category} courses`)
        }
      }
    }

    // Boost for courses with no category match but popular difficulty
    if (!course.category || !context.userCategories.includes(course.category)) {
      if (course.difficulty_level === "beginner") {
        score += 10
        reasons.push(`Great starting point`)
      }
    }

    // Recency boost (newer courses get slight boost)
    const daysSinceCreation = Math.floor(
      (Date.now() - new Date(course.created_at).getTime()) / (1000 * 60 * 60 * 24),
    )
    if (daysSinceCreation < 30) {
      score += 5
      reasons.push(`Newly added course`)
    }

    // Default reason if no specific match
    if (reasons.length === 0) {
      reasons.push(`Popular course you might enjoy`)
    }

    return {
      score,
      reason: reasons[0] || "Recommended for you",
    }
  }

  /**
   * Check if difficulty is the next level up from user's current levels
   */
  private isNextLevel(
    courseDifficulty: DifficultyLevel | undefined,
    userDifficulties: DifficultyLevel[],
  ): boolean {
    if (!courseDifficulty) return false

    const difficultyOrder: DifficultyLevel[] = ["beginner", "intermediate", "advanced"]

    // If user has completed beginner, intermediate is next level
    if (userDifficulties.includes("beginner") && courseDifficulty === "intermediate") {
      return true
    }

    // If user has completed intermediate, advanced is next level
    if (userDifficulties.includes("intermediate") && courseDifficulty === "advanced") {
      return true
    }

    return false
  }

  /**
   * Get trending/popular courses (for users with no enrollment history)
   */
  async getTrendingCourses(limit: number = 6): Promise<CourseRecommendation[]> {
    const supabase = await createServerClient()

    // Get courses with most enrollments
    const { data: enrollments } = await supabase
      .from("course_enrollments")
      .select("course_id")

    const enrollmentCounts = new Map<string, number>()
    enrollments?.forEach((e) => {
      enrollmentCounts.set(e.course_id, (enrollmentCounts.get(e.course_id) || 0) + 1)
    })

    // Get all published courses
    const { data: courses } = await supabase
      .from("courses")
      .select(
        `
        *,
        instructor:profiles!courses_instructor_id_fkey(id, full_name, email)
      `,
      )
      .eq("is_published", true)
      .order("created_at", { ascending: false })

    if (!courses) return []

    // Sort by enrollment count and recency
    const recommendations: CourseRecommendation[] = courses
      .map((course) => {
        const enrollmentCount = enrollmentCounts.get(course.id) || 0
        return {
          ...course,
          recommendation_score: enrollmentCount * 10 + (course.created_at ? 5 : 0),
          recommendation_reason: enrollmentCount > 0 ? `Popular with ${enrollmentCount} learners` : "New course",
        } as CourseRecommendation
      })
      .sort((a, b) => b.recommendation_score - a.recommendation_score)
      .slice(0, limit)

    return recommendations
  }
}

