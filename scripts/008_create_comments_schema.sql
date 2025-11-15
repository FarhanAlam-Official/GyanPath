-- Create lesson_comments table
CREATE TABLE IF NOT EXISTS public.lesson_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lesson_id UUID NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  parent_comment_id UUID REFERENCES public.lesson_comments(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  likes_count INTEGER DEFAULT 0,
  is_helpful BOOLEAN DEFAULT false,
  is_pinned BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create comment_likes table
CREATE TABLE IF NOT EXISTS public.comment_likes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  comment_id UUID NOT NULL REFERENCES public.lesson_comments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(comment_id, user_id)
);

-- Enable Row Level Security
ALTER TABLE public.lesson_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comment_likes ENABLE ROW LEVEL SECURITY;

-- Comments RLS Policies
CREATE POLICY "Anyone can view comments for published lessons"
  ON public.lesson_comments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.lessons l
      JOIN public.courses c ON l.course_id = c.id
      WHERE l.id = lesson_id AND l.is_published = true AND c.is_published = true
    )
  );

CREATE POLICY "Users can create comments"
  ON public.lesson_comments FOR INSERT
  WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM public.lessons l
      JOIN public.courses c ON l.course_id = c.id
      JOIN public.course_enrollments ce ON c.id = ce.course_id
      WHERE l.id = lesson_id 
        AND l.is_published = true 
        AND c.is_published = true
        AND ce.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own comments"
  ON public.lesson_comments FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments"
  ON public.lesson_comments FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Instructors can moderate comments for their lessons"
  ON public.lesson_comments FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.lessons l
      JOIN public.courses c ON l.course_id = c.id
      WHERE l.id = lesson_id AND c.instructor_id = auth.uid()
    )
  );

-- Comment Likes RLS Policies
CREATE POLICY "Anyone can view comment likes"
  ON public.comment_likes FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.lesson_comments
      WHERE id = comment_id
    )
  );

CREATE POLICY "Users can like/unlike comments"
  ON public.comment_likes FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create indexes
CREATE INDEX idx_lesson_comments_lesson ON public.lesson_comments(lesson_id);
CREATE INDEX idx_lesson_comments_parent ON public.lesson_comments(parent_comment_id);
CREATE INDEX idx_lesson_comments_user ON public.lesson_comments(user_id);
CREATE INDEX idx_comment_likes_comment ON public.comment_likes(comment_id);
CREATE INDEX idx_comment_likes_user ON public.comment_likes(user_id);

-- Trigger to update likes_count
CREATE OR REPLACE FUNCTION update_comment_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.lesson_comments
    SET likes_count = likes_count + 1
    WHERE id = NEW.comment_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.lesson_comments
    SET likes_count = GREATEST(likes_count - 1, 0)
    WHERE id = OLD.comment_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_comment_likes_count_trigger
  AFTER INSERT OR DELETE ON public.comment_likes
  FOR EACH ROW
  EXECUTE FUNCTION update_comment_likes_count();

-- Trigger for updated_at
CREATE TRIGGER update_lesson_comments_updated_at
  BEFORE UPDATE ON public.lesson_comments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

