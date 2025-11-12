-- Certificates table
CREATE TABLE IF NOT EXISTS certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  certificate_number TEXT NOT NULL UNIQUE,
  issued_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  verification_code TEXT NOT NULL UNIQUE,
  score DECIMAL(5,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_certificates_user_id ON certificates(user_id);
CREATE INDEX IF NOT EXISTS idx_certificates_course_id ON certificates(course_id);
CREATE INDEX IF NOT EXISTS idx_certificates_verification_code ON certificates(verification_code);

-- Enable RLS
ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Fixed to reference correct profiles table instead of user_profiles
CREATE POLICY "Users can view their own certificates"
  ON certificates FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert certificates"
  ON certificates FOR INSERT
  WITH CHECK (true);

-- Function to check course completion
CREATE OR REPLACE FUNCTION check_course_completion(p_user_id UUID, p_course_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  total_lessons INTEGER;
  completed_lessons INTEGER;
  total_quizzes INTEGER;
  passed_quizzes INTEGER;
BEGIN
  -- Count total lessons
  SELECT COUNT(*) INTO total_lessons
  FROM lessons
  WHERE course_id = p_course_id;
  
  -- Count completed lessons (watched videos)
  SELECT COUNT(DISTINCT lesson_id) INTO completed_lessons
  FROM lesson_progress
  WHERE user_id = p_user_id
  AND lesson_id IN (SELECT id FROM lessons WHERE course_id = p_course_id)
  AND is_completed = true;
  
  -- Count total quizzes
  SELECT COUNT(*) INTO total_quizzes
  FROM quizzes
  WHERE lesson_id IN (SELECT id FROM lessons WHERE course_id = p_course_id);
  
  -- Count passed quizzes
  SELECT COUNT(DISTINCT quiz_id) INTO passed_quizzes
  FROM quiz_attempts
  WHERE user_id = p_user_id
  AND quiz_id IN (
    SELECT id FROM quizzes 
    WHERE lesson_id IN (SELECT id FROM lessons WHERE course_id = p_course_id)
  )
  AND passed = true;
  
  -- Check if all lessons completed and all quizzes passed
  RETURN (completed_lessons = total_lessons) AND (passed_quizzes = total_quizzes);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to calculate average score
CREATE OR REPLACE FUNCTION calculate_course_score(p_user_id UUID, p_course_id UUID)
RETURNS DECIMAL AS $$
DECLARE
  avg_score DECIMAL;
BEGIN
  SELECT AVG(score) INTO avg_score
  FROM quiz_attempts
  WHERE user_id = p_user_id
  AND quiz_id IN (
    SELECT id FROM quizzes 
    WHERE lesson_id IN (SELECT id FROM lessons WHERE course_id = p_course_id)
  )
  AND passed = true;
  
  RETURN COALESCE(avg_score, 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
