-- Create course_ratings table
CREATE TABLE IF NOT EXISTS public.course_ratings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review TEXT,
  is_helpful_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(course_id, user_id)
);

-- Create rating_helpful_votes table
CREATE TABLE IF NOT EXISTS public.rating_helpful_votes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  rating_id UUID NOT NULL REFERENCES public.course_ratings(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(rating_id, user_id)
);

-- Add average_rating and ratings_count columns to courses table
ALTER TABLE public.courses 
ADD COLUMN IF NOT EXISTS average_rating DECIMAL(3,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS ratings_count INTEGER DEFAULT 0;

-- Enable Row Level Security
ALTER TABLE public.course_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rating_helpful_votes ENABLE ROW LEVEL SECURITY;

-- Course Ratings RLS Policies
CREATE POLICY "Anyone can view ratings for published courses"
  ON public.course_ratings FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.courses
      WHERE id = course_id AND is_published = true
    )
  );

CREATE POLICY "Users can create ratings for enrolled courses"
  ON public.course_ratings FOR INSERT
  WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM public.courses c
      JOIN public.course_enrollments ce ON c.id = ce.course_id
      WHERE c.id = course_id 
        AND c.is_published = true
        AND ce.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own ratings"
  ON public.course_ratings FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own ratings"
  ON public.course_ratings FOR DELETE
  USING (auth.uid() = user_id);

-- Rating Helpful Votes RLS Policies
CREATE POLICY "Anyone can view helpful votes"
  ON public.rating_helpful_votes FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.course_ratings
      WHERE id = rating_id
    )
  );

CREATE POLICY "Users can vote on ratings"
  ON public.rating_helpful_votes FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create indexes
CREATE INDEX idx_course_ratings_course ON public.course_ratings(course_id);
CREATE INDEX idx_course_ratings_user ON public.course_ratings(user_id);
CREATE INDEX idx_rating_helpful_votes_rating ON public.rating_helpful_votes(rating_id);
CREATE INDEX idx_rating_helpful_votes_user ON public.rating_helpful_votes(user_id);

-- Function to update course average rating
CREATE OR REPLACE FUNCTION update_course_rating_stats()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    UPDATE public.courses
    SET 
      average_rating = (
        SELECT COALESCE(ROUND(AVG(rating)::numeric, 2), 0)
        FROM public.course_ratings
        WHERE course_id = NEW.course_id
      ),
      ratings_count = (
        SELECT COUNT(*)
        FROM public.course_ratings
        WHERE course_id = NEW.course_id
      )
    WHERE id = NEW.course_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.courses
    SET 
      average_rating = (
        SELECT COALESCE(ROUND(AVG(rating)::numeric, 2), 0)
        FROM public.course_ratings
        WHERE course_id = OLD.course_id
      ),
      ratings_count = (
        SELECT COUNT(*)
        FROM public.course_ratings
        WHERE course_id = OLD.course_id
      )
    WHERE id = OLD.course_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update course rating stats
CREATE TRIGGER update_course_rating_stats_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.course_ratings
  FOR EACH ROW
  EXECUTE FUNCTION update_course_rating_stats();

-- Trigger to update helpful count
CREATE OR REPLACE FUNCTION update_rating_helpful_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.course_ratings
    SET is_helpful_count = is_helpful_count + 1
    WHERE id = NEW.rating_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.course_ratings
    SET is_helpful_count = GREATEST(is_helpful_count - 1, 0)
    WHERE id = OLD.rating_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_rating_helpful_count_trigger
  AFTER INSERT OR DELETE ON public.rating_helpful_votes
  FOR EACH ROW
  EXECUTE FUNCTION update_rating_helpful_count();

-- Trigger for updated_at
CREATE TRIGGER update_course_ratings_updated_at
  BEFORE UPDATE ON public.course_ratings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

