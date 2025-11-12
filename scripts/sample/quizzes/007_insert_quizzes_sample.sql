-- ============================================================================
-- Insert sample quizzes, questions, options, attempts, and answers
-- ============================================================================
-- Requires:
--   - enrollments/006_insert_enrollments_progress_sample.sql
-- ============================================================================

DO $$
DECLARE
  v_lesson_comp_intro UUID := '9f4a2b05-18f1-4d9f-9d4e-1b4f1c6a2001';
  v_lesson_soil       UUID := '9f4a2b05-18f1-4d9f-9d4e-1b4f1c6a2004';

  v_quiz_comp_basics  UUID := '9f4a2b05-18f1-4d9f-9d4e-1b4f1c6a3001';
  v_quiz_soil_types   UUID := '9f4a2b05-18f1-4d9f-9d4e-1b4f1c6a3002';

  v_question_cpu      UUID := '9f4a2b05-18f1-4d9f-9d4e-1b4f1c6a3101';
  v_question_ram      UUID := '9f4a2b05-18f1-4d9f-9d4e-1b4f1c6a3102';

  v_option_cpu        UUID := '9f4a2b05-18f1-4d9f-9d4e-1b4f1c6a3201';
  v_option_mouse      UUID := '9f4a2b05-18f1-4d9f-9d4e-1b4f1c6a3202';
  v_option_keyboard   UUID := '9f4a2b05-18f1-4d9f-9d4e-1b4f1c6a3203';
  v_option_monitor    UUID := '9f4a2b05-18f1-4d9f-9d4e-1b4f1c6a3204';
  v_option_true       UUID := '9f4a2b05-18f1-4d9f-9d4e-1b4f1c6a3205';
  v_option_false      UUID := '9f4a2b05-18f1-4d9f-9d4e-1b4f1c6a3206';

  v_attempt1_id       UUID := '9f4a2b05-18f1-4d9f-9d4e-1b4f1c6a3301';
  v_attempt2_id       UUID := '9f4a2b05-18f1-4d9f-9d4e-1b4f1c6a3302';

  v_answer1_id        UUID := '9f4a2b05-18f1-4d9f-9d4e-1b4f1c6a3401';
  v_answer2_id        UUID := '9f4a2b05-18f1-4d9f-9d4e-1b4f1c6a3402';
  v_answer3_id        UUID := '9f4a2b05-18f1-4d9f-9d4e-1b4f1c6a3403';
  v_answer4_id        UUID := '9f4a2b05-18f1-4d9f-9d4e-1b4f1c6a3404';

  v_learner1_id UUID := (SELECT id FROM public.profiles WHERE email = 'learner1@gyanpath.test');
  v_learner2_id UUID := (SELECT id FROM public.profiles WHERE email = 'learner2@gyanpath.test');
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.lessons WHERE id IN (v_lesson_comp_intro, v_lesson_soil)) THEN
    RAISE EXCEPTION 'Lessons must be inserted before quizzes.';
  END IF;

  INSERT INTO public.quizzes (id, lesson_id, title, title_ne, description, description_ne, passing_score, is_published, time_limit_minutes, shuffle_questions, allow_retry, show_explanations)
  VALUES
    (v_quiz_comp_basics, v_lesson_comp_intro, 'Computer Basics Quiz', 'कम्प्युटर आधारभूत प्रश्नोत्तरी', 'Test your knowledge of computer fundamentals.', 'कम्प्युटर आधारभूत ज्ञानको परीक्षा।', 70, true, 15, false, true, true),
    (v_quiz_soil_types,  v_lesson_soil,       'Soil Types Assessment', 'माटोको प्रकार मूल्याङ्कन', 'Assess your understanding of soil types.', 'माटोको प्रकारहरूको बुझाइको मूल्याङ्कन।', 60, true, 20, true, true, true)
  ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    title_ne = EXCLUDED.title_ne,
    description = EXCLUDED.description,
    description_ne = EXCLUDED.description_ne,
    passing_score = EXCLUDED.passing_score,
    is_published = EXCLUDED.is_published,
    time_limit_minutes = EXCLUDED.time_limit_minutes,
    shuffle_questions = EXCLUDED.shuffle_questions,
    allow_retry = EXCLUDED.allow_retry,
    show_explanations = EXCLUDED.show_explanations;

  INSERT INTO public.quiz_questions (id, quiz_id, question_text, question_text_ne, question_type, order_index, explanation, explanation_ne)
  VALUES
    (v_question_cpu, v_quiz_comp_basics, 'What is the main component of a computer?', 'कम्प्युटरको मुख्य घटक के हो?', 'multiple_choice', 1, 'CPU is the brain of the computer.', 'CPU कम्प्युटरको दिमाग हो।'),
    (v_question_ram, v_quiz_comp_basics, 'RAM stands for Random Access Memory.', 'RAM ले Random Access Memory लाई जनाउँछ।', 'true_false', 2, 'RAM is temporary storage.', 'RAM अस्थायी भण्डारण हो।')
  ON CONFLICT (id) DO UPDATE SET
    question_text = EXCLUDED.question_text,
    question_text_ne = EXCLUDED.question_text_ne,
    question_type = EXCLUDED.question_type,
    order_index = EXCLUDED.order_index,
    explanation = EXCLUDED.explanation,
    explanation_ne = EXCLUDED.explanation_ne;

  INSERT INTO public.quiz_options (id, question_id, option_text, option_text_ne, is_correct, order_index)
  VALUES
    (v_option_cpu,      v_question_cpu, 'CPU',     'CPU',     true,  1),
    (v_option_mouse,    v_question_cpu, 'Mouse',   'माउस',    false, 2),
    (v_option_keyboard, v_question_cpu, 'Keyboard','किबोर्ड', false, 3),
    (v_option_monitor,  v_question_cpu, 'Monitor', 'मोनिटर',  false, 4),
    (v_option_true,     v_question_ram, 'True',    'सत्य',     true,  1),
    (v_option_false,    v_question_ram, 'False',   'असत्य',    false, 2)
  ON CONFLICT (id) DO UPDATE SET
    option_text = EXCLUDED.option_text,
    option_text_ne = EXCLUDED.option_text_ne,
    is_correct = EXCLUDED.is_correct,
    order_index = EXCLUDED.order_index;

  INSERT INTO public.quiz_attempts (id, quiz_id, user_id, score, total_questions, passed, completed_at, time_taken_seconds, started_at)
  VALUES
    (v_attempt1_id, v_quiz_comp_basics, v_learner1_id, 100, 2, true,  NOW() - INTERVAL '1 day', 480, NOW() - INTERVAL '1 day' - INTERVAL '8 minutes'),
    (v_attempt2_id, v_quiz_comp_basics, v_learner2_id,  50, 2, false, NOW() - INTERVAL '2 hours', 600, NOW() - INTERVAL '2 hours' - INTERVAL '10 minutes')
  ON CONFLICT (id) DO UPDATE SET
    score = EXCLUDED.score,
    total_questions = EXCLUDED.total_questions,
    passed = EXCLUDED.passed,
    completed_at = EXCLUDED.completed_at,
    time_taken_seconds = EXCLUDED.time_taken_seconds,
    started_at = EXCLUDED.started_at;

  INSERT INTO public.quiz_answers (id, attempt_id, question_id, selected_option_id, is_correct)
  VALUES
    (v_answer1_id, v_attempt1_id, v_question_cpu, v_option_cpu,   true),
    (v_answer2_id, v_attempt1_id, v_question_ram, v_option_true,  true),
    (v_answer3_id, v_attempt2_id, v_question_cpu, v_option_cpu,   true),
    (v_answer4_id, v_attempt2_id, v_question_ram, NULL,           false)
  ON CONFLICT (id) DO UPDATE SET
    selected_option_id = EXCLUDED.selected_option_id,
    is_correct = EXCLUDED.is_correct;

  RAISE NOTICE 'Sample quizzes and related data inserted/updated successfully.';
END;
$$;

