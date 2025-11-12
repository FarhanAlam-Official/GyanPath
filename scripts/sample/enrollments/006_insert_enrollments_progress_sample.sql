-- ============================================================================
-- Insert sample enrollments and lesson progress
-- ============================================================================
-- Requires:
--   - lessons/005_insert_lessons_sample.sql
-- ============================================================================

DO $$
DECLARE
  v_course_digital_literacy UUID := '9f4a2b05-18f1-4d9f-9d4e-1b4f1c6a1001';
  v_course_agriculture      UUID := '9f4a2b05-18f1-4d9f-9d4e-1b4f1c6a1002';
  v_course_english          UUID := '9f4a2b05-18f1-4d9f-9d4e-1b4f1c6a1003';

  v_lesson_comp_intro       UUID := '9f4a2b05-18f1-4d9f-9d4e-1b4f1c6a2001';
  v_lesson_email            UUID := '9f4a2b05-18f1-4d9f-9d4e-1b4f1c6a2002';
  v_lesson_internet         UUID := '9f4a2b05-18f1-4d9f-9d4e-1b4f1c6a2003';
  v_lesson_soil             UUID := '9f4a2b05-18f1-4d9f-9d4e-1b4f1c6a2004';
  v_lesson_crop_rotation    UUID := '9f4a2b05-18f1-4d9f-9d4e-1b4f1c6a2005';
  v_lesson_greetings        UUID := '9f4a2b05-18f1-4d9f-9d4e-1b4f1c6a2006';

  v_learner1_id UUID := (SELECT id FROM public.profiles WHERE email = 'learner1@gyanpath.test');
  v_learner2_id UUID := (SELECT id FROM public.profiles WHERE email = 'learner2@gyanpath.test');
  v_learner3_id UUID := (SELECT id FROM public.profiles WHERE email = 'learner3@gyanpath.test');
BEGIN
  IF v_learner1_id IS NULL OR v_learner2_id IS NULL OR v_learner3_id IS NULL THEN
    RAISE EXCEPTION 'Learner profiles must be inserted before enrollments.';
  END IF;

  PERFORM sample_insert_enrollment(v_course_digital_literacy, v_learner1_id, 50);
  PERFORM sample_insert_enrollment(v_course_digital_literacy, v_learner2_id, 100);
  PERFORM sample_insert_enrollment(v_course_agriculture,      v_learner1_id, 30);
  PERFORM sample_insert_enrollment(v_course_agriculture,      v_learner3_id, 0);
  PERFORM sample_insert_enrollment(v_course_english,          v_learner2_id, 100);

  INSERT INTO public.lesson_progress (lesson_id, user_id, is_completed, video_progress_seconds, completed_at, last_accessed_at)
  VALUES
    (v_lesson_comp_intro,    v_learner1_id, true,  600, NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days'),
    (v_lesson_email,         v_learner1_id, false, 300, NULL,                     NOW() - INTERVAL '1 day'),
    (v_lesson_comp_intro,    v_learner2_id, true,  600, NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day'),
    (v_lesson_email,         v_learner2_id, true,  900, NOW() - INTERVAL '1 day', NOW() - INTERVAL '12 hours'),
    (v_lesson_internet,      v_learner2_id, true,  750, NOW() - INTERVAL '12 hours', NOW() - INTERVAL '6 hours'),
    (v_lesson_soil,          v_learner1_id, true,  1200, NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days'),
    (v_lesson_greetings,     v_learner2_id, true,  450, NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days')
  ON CONFLICT (lesson_id, user_id) DO UPDATE SET
    is_completed = EXCLUDED.is_completed,
    video_progress_seconds = EXCLUDED.video_progress_seconds,
    completed_at = EXCLUDED.completed_at,
    last_accessed_at = EXCLUDED.last_accessed_at;

  -- Update progress percentages based on completed lessons
  UPDATE public.course_enrollments ce
  SET progress_percentage = (
    SELECT CASE
      WHEN COUNT(DISTINCT l.id) = 0 THEN 0
      ELSE ROUND((COUNT(DISTINCT lp.lesson_id)::numeric / COUNT(DISTINCT l.id)::numeric) * 100)
    END
    FROM public.lessons l
    LEFT JOIN public.lesson_progress lp
      ON l.id = lp.lesson_id AND lp.user_id = ce.user_id AND lp.is_completed = true
    WHERE l.course_id = ce.course_id AND l.is_published = true
  )
  WHERE ce.course_id IN (v_course_digital_literacy, v_course_agriculture, v_course_english);

  UPDATE public.course_enrollments
  SET completed_at = NOW(), progress_percentage = 100
  WHERE progress_percentage = 100 AND completed_at IS NULL;

  RAISE NOTICE 'Sample enrollments and lesson progress inserted/updated successfully.';
END;
$$;

