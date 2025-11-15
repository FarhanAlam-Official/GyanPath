-- Add explanation fields to quiz questions
ALTER TABLE public.quiz_questions 
ADD COLUMN IF NOT EXISTS explanation TEXT,
ADD COLUMN IF NOT EXISTS explanation_ne TEXT;

-- Add time limit and shuffle options to quizzes
ALTER TABLE public.quizzes
ADD COLUMN IF NOT EXISTS time_limit_minutes INTEGER,
ADD COLUMN IF NOT EXISTS shuffle_questions BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS allow_retry BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS retry_cooldown_hours INTEGER DEFAULT 24,
ADD COLUMN IF NOT EXISTS show_explanations BOOLEAN DEFAULT true;

-- Add retry tracking to quiz attempts
ALTER TABLE public.quiz_attempts
ADD COLUMN IF NOT EXISTS time_taken_seconds INTEGER,
ADD COLUMN IF NOT EXISTS started_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS can_retry_after TIMESTAMPTZ;

-- Create index for retry tracking
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_retry ON public.quiz_attempts(user_id, quiz_id, can_retry_after);

