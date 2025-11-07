export type UserRole = "admin" | "group_admin" | "instructor" | "learner"

export interface Profile {
  id: string
  email: string
  full_name: string
  role: UserRole
  phone?: string
  avatar_url?: string
  preferred_language: string
  created_at: string
  updated_at: string
}

export interface Group {
  id: string
  name: string
  description?: string
  group_admin_id?: string
  created_at: string
  updated_at: string
}

export interface GroupMember {
  id: string
  group_id: string
  user_id: string
  joined_at: string
}

export type DifficultyLevel = "beginner" | "intermediate" | "advanced"

export interface Course {
  id: string
  title: string
  title_ne?: string
  description?: string
  description_ne?: string
  thumbnail_url?: string
  instructor_id: string
  category?: string
  difficulty_level?: DifficultyLevel
  is_published: boolean
  estimated_duration_hours?: number
  average_rating?: number
  ratings_count?: number
  created_at: string
  updated_at: string
}

export interface Lesson {
  id: string
  course_id: string
  title: string
  title_ne?: string
  description?: string
  description_ne?: string
  video_url?: string
  video_duration_seconds?: number
  pdf_url?: string
  order_index: number
  is_published: boolean
  created_at: string
  updated_at: string
}

export interface CourseEnrollment {
  id: string
  course_id: string
  user_id: string
  enrolled_at: string
  completed_at?: string
  progress_percentage: number
}

export interface LessonProgress {
  id: string
  lesson_id: string
  user_id: string
  is_completed: boolean
  video_progress_seconds: number
  completed_at?: string
  last_accessed_at: string
}

export interface Quiz {
  id: string
  lesson_id: string
  title: string
  title_ne?: string
  description?: string
  description_ne?: string
  passing_score: number
  is_published: boolean
  time_limit_minutes?: number | null
  shuffle_questions?: boolean
  allow_retry?: boolean
  retry_cooldown_hours?: number
  show_explanations?: boolean
  created_at: string
  updated_at: string
}

export interface QuizQuestion {
  id: string
  quiz_id: string
  question_text: string
  question_text_ne?: string
  question_type: "multiple_choice" | "true_false"
  order_index: number
  explanation?: string | null
  explanation_ne?: string | null
  created_at: string
}

export interface QuizOption {
  id: string
  question_id: string
  option_text: string
  option_text_ne?: string
  is_correct: boolean
  order_index: number
  created_at: string
}

export interface QuizAttempt {
  id: string
  quiz_id: string
  user_id: string
  score: number
  total_questions: number
  passed: boolean
  time_taken_seconds?: number | null
  started_at?: string | null
  can_retry_after?: string | null
  completed_at: string
}

export interface QuizAnswer {
  id: string
  attempt_id: string
  question_id: string
  selected_option_id?: string
  is_correct: boolean
  created_at: string
}

export interface Certificate {
  id: string
  user_id: string
  course_id: string
  certificate_number: string
  issued_at: string
  verification_code: string
  score: number
  created_at: string
  updated_at: string
}

export interface LessonComment {
  id: string
  lesson_id: string
  user_id: string
  parent_comment_id?: string | null
  content: string
  likes_count: number
  is_helpful: boolean
  is_pinned: boolean
  created_at: string
  updated_at: string
  user?: Profile
  replies?: LessonComment[]
  user_liked?: boolean
}

export interface CommentLike {
  id: string
  comment_id: string
  user_id: string
  created_at: string
}

export interface CourseRating {
  id: string
  course_id: string
  user_id: string
  rating: number
  review?: string | null
  is_helpful_count: number
  created_at: string
  updated_at: string
  user?: Profile
  user_helpful?: boolean
}

export interface RatingHelpfulVote {
  id: string
  rating_id: string
  user_id: string
  created_at: string
}

// Utility types
export type Nullable<T> = T | null
export type Optional<T> = T | undefined
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P]
}
