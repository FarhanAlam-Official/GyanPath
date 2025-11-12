-- ============================================================================
-- Insert sample courses
-- ============================================================================
-- Requires:
--   - common/001_helpers.sql
--   - profiles/002_insert_profiles_sample.sql
-- ============================================================================

DO $$
DECLARE
  v_course_digital_literacy UUID := '9f4a2b05-18f1-4d9f-9d4e-1b4f1c6a1001';
  v_course_agriculture      UUID := '9f4a2b05-18f1-4d9f-9d4e-1b4f1c6a1002';
  v_course_english          UUID := '9f4a2b05-18f1-4d9f-9d4e-1b4f1c6a1003';
  v_course_webdev           UUID := '9f4a2b05-18f1-4d9f-9d4e-1b4f1c6a1004';
  v_instructor1_id          UUID := (SELECT id FROM public.profiles WHERE email = 'instructor1@gyanpath.test');
  v_instructor2_id          UUID := (SELECT id FROM public.profiles WHERE email = 'instructor2@gyanpath.test');
BEGIN
  IF v_instructor1_id IS NULL OR v_instructor2_id IS NULL THEN
    RAISE EXCEPTION 'Instructor profiles must be inserted before courses.';
  END IF;

  PERFORM sample_insert_course(
    v_course_digital_literacy,
    'Introduction to Digital Literacy',
    'डिजिटल साक्षरताको परिचय',
    'Learn the fundamentals of using computers, smartphones, and the internet. This course covers basic computer operations, email, web browsing, and online safety.',
    'कम्प्युटर, स्मार्टफोन र इन्टरनेट प्रयोग गर्ने मौलिक ज्ञान सिक्नुहोस्। यस पाठ्यक्रमले आधारभूत कम्प्युटर सञ्चालन, इमेल, वेब ब्राउजिङ, र अनलाइन सुरक्षा समावेश गर्दछ।',
    NULL,
    v_instructor1_id,
    'Technology',
    'beginner',
    true,
    20
  );

  PERFORM sample_insert_course(
    v_course_agriculture,
    'Agricultural Best Practices',
    'कृषि उत्तम अभ्यासहरू',
    'Modern farming techniques for sustainable agriculture. Learn about crop rotation, organic farming, water management, and pest control.',
    'टिकाउ कृषिको लागि आधुनिक खेती प्रविधिहरू। बाली घुमाउरो, जैविक खेती, पानी व्यवस्थापन, र कीट नियन्त्रण बारे जान्नुहोस्।',
    NULL,
    v_instructor2_id,
    'Agriculture',
    'intermediate',
    true,
    30
  );

  PERFORM sample_insert_course(
    v_course_english,
    'Basic English Communication',
    'आधारभूत अङ्ग्रेजी संचार',
    'Improve your English speaking, listening, reading, and writing skills. Perfect for beginners who want to communicate effectively in English.',
    'तपाईंको अङ्ग्रेजी बोलचाल, सुनाइ, पढाइ, र लेखाइ कौशल सुधार गर्नुहोस्। अङ्ग्रेजीमा प्रभावकारी रूपमा संचार गर्न चाहने शुरुवातीहरूको लागि उत्तम।',
    NULL,
    v_instructor1_id,
    'Language',
    'beginner',
    true,
    40
  );

  PERFORM sample_insert_course(
    v_course_webdev,
    'Advanced Web Development',
    'उन्नत वेब विकास',
    'Master modern web development with React, Node.js, and databases. Build full-stack applications and deploy them to production.',
    'React, Node.js, र डेटाबेसको साथ आधुनिक वेब विकासमा निपुण हुनुहोस्। पूर्ण-स्ट्याक अनुप्रयोगहरू निर्माण गर्नुहोस् र उत्पादनमा तैनाथ गर्नुहोस्।',
    NULL,
    v_instructor2_id,
    'Technology',
    'advanced',
    false,
    60
  );

  RAISE NOTICE 'Sample courses inserted/updated successfully.';
END;
$$;

