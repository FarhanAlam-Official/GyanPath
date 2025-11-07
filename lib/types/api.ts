import type {
  Profile,
  Course,
  Lesson,
  Quiz,
  QuizQuestion,
  QuizOption,
  QuizAttempt,
  Certificate,
  CourseEnrollment,
  LessonProgress,
  Group,
  GroupMember,
} from "@/lib/types"

// API Response Types
export interface ApiResponse<T> {
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  count: number
  page: number
  pageSize: number
  totalPages: number
}

// Auth API Types
export interface SignUpRequest {
  email: string
  password: string
  full_name: string
  role: "admin" | "group_admin" | "instructor" | "learner"
  preferred_language: string
}

export interface SignInRequest {
  email: string
  password: string
}

export interface AuthResponse {
  user: Profile
  session: {
    access_token: string
    refresh_token: string
  }
}

// Course API Types
export interface CreateCourseRequest {
  title: string
  title_ne?: string
  description?: string
  description_ne?: string
  thumbnail_url?: string
  category?: string
  difficulty_level?: "beginner" | "intermediate" | "advanced"
  estimated_duration_hours?: number
}

export interface UpdateCourseRequest extends Partial<CreateCourseRequest> {
  is_published?: boolean
}

export interface CourseWithInstructor extends Course {
  instructor: Profile
  enrollment_count?: number
  lesson_count?: number
}

// Lesson API Types
export interface CreateLessonRequest {
  course_id: string
  title: string
  title_ne?: string
  description?: string
  description_ne?: string
  video_url?: string
  video_duration_seconds?: number
  pdf_url?: string
  order_index: number
}

export interface UpdateLessonRequest extends Partial<CreateLessonRequest> {
  is_published?: boolean
}

export interface LessonWithProgress extends Lesson {
  progress?: LessonProgress
  quiz?: Quiz
}

// Quiz API Types
export interface CreateQuizRequest {
  lesson_id: string
  title: string
  title_ne?: string
  description?: string
  description_ne?: string
  passing_score: number
}

export interface CreateQuestionRequest {
  quiz_id: string
  question_text: string
  question_text_ne?: string
  question_type: "multiple_choice" | "true_false"
  order_index: number
  options: Array<{
    option_text: string
    option_text_ne?: string
    is_correct: boolean
    order_index: number
  }>
}

export interface QuizWithQuestions extends Quiz {
  questions: Array<QuizQuestion & { options: QuizOption[] }>
}

export interface QuizAttemptWithDetails extends QuizAttempt {
  answers: Array<{
    question_id: string
    selected_option_id?: string
    is_correct: boolean
    question: QuizQuestion
    selected_option?: QuizOption
  }>
}

// Certificate API Types
export interface CertificateGenerationRequest {
  course_id: string
}

export interface CertificateWithDetails extends Certificate {
  course: Course
  user: Profile
  verification_url: string
}

// Enrollment API Types
export interface EnrollmentRequest {
  course_id: string
}

export interface EnrollmentWithCourse extends CourseEnrollment {
  course: Course
}

// Progress API Types
export interface UpdateProgressRequest {
  lesson_id: string
  video_progress_seconds: number
  is_completed: boolean
}

export interface ProgressStats {
  total_lessons: number
  completed_lessons: number
  progress_percentage: number
  total_video_time: number
  watched_video_time: number
}

// Group API Types
export interface CreateGroupRequest {
  name: string
  description?: string
  group_admin_id?: string
}

export interface UpdateGroupRequest extends Partial<CreateGroupRequest> {}

export interface GroupWithMembers extends Group {
  members: Array<GroupMember & { user: Profile }>
  member_count: number
}

// Upload API Types
export interface UploadResponse {
  url: string
  path: string
  size: number
  type: string
}

export interface UploadRequest {
  file: File
  bucket: "videos" | "pdfs" | "images" | "thumbnails"
  folder?: string
}

// Analytics API Types
export interface DashboardStats {
  total_users: number
  total_courses: number
  total_enrollments: number
  total_certificates: number
  active_learners: number
  completion_rate: number
}

export interface CourseAnalytics {
  course_id: string
  course: Course
  total_enrollments: number
  completed_enrollments: number
  average_score: number
  average_completion_time: number
  popular_lessons: Array<{
    lesson_id: string
    view_count: number
  }>
}

export interface UserAnalytics {
  user_id: string
  total_enrollments: number
  completed_courses: number
  average_score: number
  total_study_time: number
  certificates_earned: number
}

