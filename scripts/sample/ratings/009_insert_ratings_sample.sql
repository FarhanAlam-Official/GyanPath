-- ============================================================================
-- Insert sample course ratings and helpful votes
-- ============================================================================
-- Requires:
--   - enrollments/006_insert_enrollments_progress_sample.sql
-- ============================================================================

DO $$
DECLARE
  v_course_digital_literacy UUID := '9f4a2b05-18f1-4d9f-9d4e-1b4f1c6a1001';
  v_course_agriculture      UUID := '9f4a2b05-18f1-4d9f-9d4e-1b4f1c6a1002';
  v_course_english          UUID := '9f4a2b05-18f1-4d9f-9d4e-1b4f1c6a1003';

  v_rating1_id UUID := '9f4a2b05-18f1-4d9f-9d4e-1b4f1c6a5001';
  v_rating2_id UUID := '9f4a2b05-18f1-4d9f-9d4e-1b4f1c6a5002';
  v_rating3_id UUID := '9f4a2b05-18f1-4d9f-9d4e-1b4f1c6a5003';
  v_rating4_id UUID := '9f4a2b05-18f1-4d9f-9d4e-1b4f1c6a5004';

  v_vote1_id   UUID := '9f4a2b05-18f1-4d9f-9d4e-1b4f1c6a5101';
  v_vote2_id   UUID := '9f4a2b05-18f1-4d9f-9d4e-1b4f1c6a5102';
  v_vote3_id   UUID := '9f4a2b05-18f1-4d9f-9d4e-1b4f1c6a5103';

  v_learner1_id UUID := (SELECT id FROM public.profiles WHERE email = 'learner1@gyanpath.test');
  v_learner2_id UUID := (SELECT id FROM public.profiles WHERE email = 'learner2@gyanpath.test');
  v_learner3_id UUID := (SELECT id FROM public.profiles WHERE email = 'learner3@gyanpath.test');
BEGIN
  INSERT INTO public.course_ratings (id, course_id, user_id, rating, review, is_helpful_count)
  VALUES
    (v_rating1_id, v_course_digital_literacy, v_learner1_id, 5, 'Excellent course! Very comprehensive and easy to follow.', 2),
    (v_rating2_id, v_course_digital_literacy, v_learner2_id, 4, 'Good course, but could use more examples.', 1),
    (v_rating3_id, v_course_agriculture,      v_learner1_id, 5, 'Perfect for farmers looking to improve their practices.', 2),
    (v_rating4_id, v_course_english,          v_learner2_id, 5, 'Great for English beginners!', 1)
  ON CONFLICT (id) DO UPDATE SET
    rating = EXCLUDED.rating,
    review = EXCLUDED.review;

  INSERT INTO public.rating_helpful_votes (id, rating_id, user_id)
  VALUES
    (v_vote1_id, v_rating1_id, v_learner2_id),
    (v_vote2_id, v_rating1_id, v_learner3_id),
    (v_vote3_id, v_rating3_id, v_learner2_id)
  ON CONFLICT (id) DO NOTHING;

  RAISE NOTICE 'Sample ratings and helpful votes inserted/updated successfully.';
END;
$$;

