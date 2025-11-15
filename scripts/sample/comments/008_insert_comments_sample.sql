-- ============================================================================
-- Insert sample lesson comments and likes
-- ============================================================================
-- Requires:
--   - quizzes/007_insert_quizzes_sample.sql (for learners & lessons)
-- ============================================================================

DO $$
DECLARE
  v_lesson_comp_intro UUID := '9f4a2b05-18f1-4d9f-9d4e-1b4f1c6a2001';
  v_comment_root_id   UUID := '9f4a2b05-18f1-4d9f-9d4e-1b4f1c6a4001';
  v_comment_reply_id  UUID := '9f4a2b05-18f1-4d9f-9d4e-1b4f1c6a4002';

  v_like1_id          UUID := '9f4a2b05-18f1-4d9f-9d4e-1b4f1c6a4101';
  v_like2_id          UUID := '9f4a2b05-18f1-4d9f-9d4e-1b4f1c6a4102';
  v_like3_id          UUID := '9f4a2b05-18f1-4d9f-9d4e-1b4f1c6a4103';

  v_learner1_id UUID := (SELECT id FROM public.profiles WHERE email = 'learner1@gyanpath.test');
  v_learner2_id UUID := (SELECT id FROM public.profiles WHERE email = 'learner2@gyanpath.test');
  v_learner3_id UUID := (SELECT id FROM public.profiles WHERE email = 'learner3@gyanpath.test');
BEGIN
  IF v_lesson_comp_intro IS NULL OR NOT EXISTS (SELECT 1 FROM public.lessons WHERE id = v_lesson_comp_intro) THEN
    RAISE EXCEPTION 'Lessons must be inserted before comments.';
  END IF;

  INSERT INTO public.lesson_comments (id, lesson_id, user_id, parent_comment_id, content, likes_count, is_helpful, is_pinned)
  VALUES
    (v_comment_root_id,  v_lesson_comp_intro, v_learner1_id, NULL,           'Great lesson! Very helpful for beginners.', 2, false, false),
    (v_comment_reply_id, v_lesson_comp_intro, v_learner2_id, v_comment_root_id, 'I agree! This helped me a lot.',             1, false, false)
  ON CONFLICT (id) DO UPDATE SET
    content = EXCLUDED.content,
    likes_count = EXCLUDED.likes_count,
    is_helpful = EXCLUDED.is_helpful,
    is_pinned = EXCLUDED.is_pinned;

  INSERT INTO public.comment_likes (id, comment_id, user_id)
  VALUES
    (v_like1_id, v_comment_root_id, v_learner2_id),
    (v_like2_id, v_comment_root_id, v_learner3_id),
    (v_like3_id, v_comment_reply_id, v_learner1_id)
  ON CONFLICT (id) DO NOTHING;

  RAISE NOTICE 'Sample comments and likes inserted/updated successfully.';
END;
$$;

