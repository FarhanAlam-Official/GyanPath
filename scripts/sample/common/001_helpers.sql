-- ============================================================================
-- Helper functions for inserting sample data
-- ============================================================================
-- Run this script once before executing any of the other sample data scripts.
-- It defines SECURITY DEFINER helper functions that bypass RLS safely while
-- still enforcing prerequisite checks (such as requiring auth.users to exist).
-- ============================================================================

CREATE OR REPLACE FUNCTION sample_insert_profile(
  p_id UUID,
  p_email TEXT,
  p_full_name TEXT,
  p_role TEXT,
  p_phone TEXT DEFAULT NULL,
  p_avatar_url TEXT DEFAULT NULL
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_exists BOOLEAN;
BEGIN
  SELECT true INTO v_exists FROM auth.users WHERE id = p_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Auth user with id % is missing. Create auth.users entry before inserting profile.', p_id;
  END IF;

  INSERT INTO public.profiles (id, email, full_name, role, phone, avatar_url, preferred_language)
  VALUES (p_id, p_email, p_full_name, p_role::user_role, p_phone, p_avatar_url, 'en')
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    role = EXCLUDED.role::user_role,
    phone = EXCLUDED.phone,
    avatar_url = EXCLUDED.avatar_url;

  RETURN p_id;
END;
$$;


CREATE OR REPLACE FUNCTION sample_insert_course(
  p_id UUID,
  p_title TEXT,
  p_title_ne TEXT,
  p_description TEXT,
  p_description_ne TEXT,
  p_thumbnail_url TEXT,
  p_instructor_id UUID,
  p_category TEXT,
  p_difficulty_level TEXT,
  p_is_published BOOLEAN,
  p_estimated_duration_hours INTEGER
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_instructor_exists BOOLEAN;
BEGIN
  SELECT true INTO v_instructor_exists
  FROM public.profiles
  WHERE id = p_instructor_id AND role IN ('instructor', 'admin');

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Instructor % not found or does not have instructor/admin role.', p_instructor_id;
  END IF;

  INSERT INTO public.courses (
    id, title, title_ne, description, description_ne, thumbnail_url,
    instructor_id, category, difficulty_level, is_published, estimated_duration_hours
  )
  VALUES (
    p_id, p_title, p_title_ne, p_description, p_description_ne, p_thumbnail_url,
    p_instructor_id, p_category, p_difficulty_level, p_is_published, p_estimated_duration_hours
  )
  ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    title_ne = EXCLUDED.title_ne,
    description = EXCLUDED.description,
    description_ne = EXCLUDED.description_ne,
    thumbnail_url = EXCLUDED.thumbnail_url,
    category = EXCLUDED.category,
    difficulty_level = EXCLUDED.difficulty_level,
    is_published = EXCLUDED.is_published,
    estimated_duration_hours = EXCLUDED.estimated_duration_hours;

  RETURN p_id;
END;
$$;


CREATE OR REPLACE FUNCTION sample_insert_enrollment(
  p_course_id UUID,
  p_user_id UUID,
  p_progress_percentage INTEGER DEFAULT 0
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_enrollment_id UUID;
BEGIN
  INSERT INTO public.course_enrollments (course_id, user_id, progress_percentage)
  VALUES (p_course_id, p_user_id, p_progress_percentage)
  ON CONFLICT (course_id, user_id) DO UPDATE SET
    progress_percentage = EXCLUDED.progress_percentage
  RETURNING id INTO v_enrollment_id;

  RETURN v_enrollment_id;
END;
$$;


COMMENT ON FUNCTION sample_insert_profile(UUID, TEXT, TEXT, TEXT, TEXT, TEXT)
IS 'Helper for inserting sample profiles. Requires matching auth.users record.';

COMMENT ON FUNCTION sample_insert_course(UUID, TEXT, TEXT, TEXT, TEXT, TEXT, UUID, TEXT, TEXT, BOOLEAN, INTEGER)
IS 'Helper for inserting sample courses with instructor validation.';

COMMENT ON FUNCTION sample_insert_enrollment(UUID, UUID, INTEGER)
IS 'Helper for inserting sample course enrollments with upsert semantics.';

