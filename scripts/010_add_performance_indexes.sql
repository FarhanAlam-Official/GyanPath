-- Performance optimization indexes
-- These indexes improve query performance for common operations

-- Course queries
CREATE INDEX IF NOT EXISTS idx_courses_published ON public.courses(is_published) WHERE is_published = true;
CREATE INDEX IF NOT EXISTS idx_courses_category ON public.courses(category) WHERE category IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_courses_instructor ON public.courses(instructor_id);
CREATE INDEX IF NOT EXISTS idx_courses_created ON public.courses(created_at DESC);

-- Lesson queries
CREATE INDEX IF NOT EXISTS idx_lessons_course_published ON public.lessons(course_id, is_published) WHERE is_published = true;
CREATE INDEX IF NOT EXISTS idx_lessons_order ON public.lessons(course_id, order_index);

-- Enrollment queries
CREATE INDEX IF NOT EXISTS idx_enrollments_user ON public.course_enrollments(user_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_course ON public.course_enrollments(course_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_progress ON public.course_enrollments(progress_percentage) WHERE progress_percentage < 100;

-- Progress queries
CREATE INDEX IF NOT EXISTS idx_lesson_progress_user_lesson ON public.lesson_progress(user_id, lesson_id);
CREATE INDEX IF NOT EXISTS idx_lesson_progress_completed ON public.lesson_progress(user_id, is_completed) WHERE is_completed = true;

-- Quiz queries
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_user_quiz ON public.quiz_attempts(user_id, quiz_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_completed ON public.quiz_attempts(completed_at DESC);

-- Comments queries
CREATE INDEX IF NOT EXISTS idx_comments_lesson_created ON public.lesson_comments(lesson_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_comments_parent ON public.lesson_comments(parent_comment_id) WHERE parent_comment_id IS NOT NULL;

-- Ratings queries
CREATE INDEX IF NOT EXISTS idx_ratings_course_created ON public.course_ratings(course_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ratings_user_course ON public.course_ratings(user_id, course_id);

-- Full-text search indexes (PostgreSQL)
-- Note: These require the pg_trgm extension for fuzzy search
-- CREATE EXTENSION IF NOT EXISTS pg_trgm;
-- CREATE INDEX IF NOT EXISTS idx_courses_title_search ON public.courses USING gin(title gin_trgm_ops);
-- CREATE INDEX IF NOT EXISTS idx_courses_description_search ON public.courses USING gin(description gin_trgm_ops);

-- Composite indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_courses_published_category ON public.courses(is_published, category) WHERE is_published = true AND category IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_enrollments_user_progress ON public.course_enrollments(user_id, progress_percentage);

