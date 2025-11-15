-- ============================================================================
-- Insert sample lessons
-- ============================================================================
-- Requires:
--   - courses/004_insert_courses_sample.sql
-- ============================================================================

DO $$
DECLARE
  v_course_digital_literacy UUID := '9f4a2b05-18f1-4d9f-9d4e-1b4f1c6a1001';
  v_course_agriculture      UUID := '9f4a2b05-18f1-4d9f-9d4e-1b4f1c6a1002';
  v_course_english          UUID := '9f4a2b05-18f1-4d9f-9d4e-1b4f1c6a1003';

  v_lesson_comp_intro   UUID := '9f4a2b05-18f1-4d9f-9d4e-1b4f1c6a2001';
  v_lesson_email        UUID := '9f4a2b05-18f1-4d9f-9d4e-1b4f1c6a2002';
  v_lesson_internet     UUID := '9f4a2b05-18f1-4d9f-9d4e-1b4f1c6a2003';
  v_lesson_soil         UUID := '9f4a2b05-18f1-4d9f-9d4e-1b4f1c6a2004';
  v_lesson_crop_rotation UUID := '9f4a2b05-18f1-4d9f-9d4e-1b4f1c6a2005';
  v_lesson_greetings    UUID := '9f4a2b05-18f1-4d9f-9d4e-1b4f1c6a2006';
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.courses WHERE id = v_course_digital_literacy) THEN
    RAISE EXCEPTION 'Sample courses must be inserted before lessons.';
  END IF;

  INSERT INTO public.lessons (id, course_id, title, title_ne, description, description_ne, video_url, video_duration_seconds, pdf_url, order_index, is_published)
  VALUES
    (v_lesson_comp_intro, v_course_digital_literacy, 'Getting Started with Computers', 'कम्प्युटरसँग सुरुवात', 'Introduction to computer hardware and software.', 'कम्प्युटर हार्डवेयर र सफ्टवेयरको परिचय।', NULL, 600, NULL, 1, true),
    (v_lesson_email,      v_course_digital_literacy, 'Using Email', 'इमेल प्रयोग', 'Learn how to create and manage email accounts.', 'इमेल खाता सिर्जना र व्यवस्थापन गर्न सिक्नुहोस्।', NULL, 900, NULL, 2, true),
    (v_lesson_internet,   v_course_digital_literacy, 'Internet Safety', 'इन्टरनेट सुरक्षा', 'Stay safe online with these essential tips.', 'यी आवश्यक सुझावहरूको साथ अनलाइन सुरक्षित रहनुहोस्।', NULL, 750, NULL, 3, true),
    (v_lesson_soil,       v_course_agriculture,      'Understanding Soil Types', 'माटोको प्रकारहरू बुझ्नु', 'Learn about different soil types and their properties.', 'विभिन्न माटोको प्रकारहरू र तिनीहरूका गुणहरू बारे जान्नुहोस्।', NULL, 1200, NULL, 1, true),
    (v_lesson_crop_rotation, v_course_agriculture,   'Crop Rotation Techniques', 'बाली घुमाउरो प्रविधिहरू', 'Master the art of crop rotation for better yields.', 'राम्रो उत्पादनको लागि बाली घुमाउरोको कलामा निपुण हुनुहोस्।', NULL, 1500, NULL, 2, true),
    (v_lesson_greetings,  v_course_english,          'Basic Greetings', 'आधारभूत अभिवादन', 'Learn common English greetings and responses.', 'सामान्य अङ्ग्रेजी अभिवादन र प्रतिक्रियाहरू सिक्नुहोस्।', NULL, 450, NULL, 1, true)
  ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    title_ne = EXCLUDED.title_ne,
    description = EXCLUDED.description,
    description_ne = EXCLUDED.description_ne,
    video_url = EXCLUDED.video_url,
    video_duration_seconds = EXCLUDED.video_duration_seconds,
    pdf_url = EXCLUDED.pdf_url,
    order_index = EXCLUDED.order_index,
    is_published = EXCLUDED.is_published;

  RAISE NOTICE 'Sample lessons inserted/updated successfully.';
END;
$$;

