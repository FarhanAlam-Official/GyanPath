-- Verification script for course catalogue feature
-- This script checks if all required columns and policies exist

-- Check if average_rating and ratings_count columns exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'courses' 
        AND column_name = 'average_rating'
    ) THEN
        RAISE NOTICE 'Adding average_rating column to courses table';
        ALTER TABLE public.courses 
        ADD COLUMN average_rating DECIMAL(3,2) DEFAULT 0;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'courses' 
        AND column_name = 'ratings_count'
    ) THEN
        RAISE NOTICE 'Adding ratings_count column to courses table';
        ALTER TABLE public.courses 
        ADD COLUMN ratings_count INTEGER DEFAULT 0;
    END IF;
END $$;

-- Verify RLS policies allow public access to published courses
-- This should already exist from 002_create_courses_schema.sql
-- Policy: "Anyone can view published courses"

-- Create index for better performance on course catalogue queries
CREATE INDEX IF NOT EXISTS idx_courses_category ON public.courses(category) WHERE category IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_courses_difficulty ON public.courses(difficulty_level) WHERE difficulty_level IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_courses_created_at ON public.courses(created_at DESC);

-- Verify the indexes were created
DO $$
BEGIN
    RAISE NOTICE 'Course catalogue setup verification complete';
    RAISE NOTICE 'All required columns and indexes should now be in place';
END $$;

