-- ============================================================================
-- Insert sample certificates
-- ============================================================================
-- Requires:
--   - ratings/009_insert_ratings_sample.sql
-- ============================================================================

DO $$
DECLARE
  v_certificate1_id UUID := '9f4a2b05-18f1-4d9f-9d4e-1b4f1c6a6001';
  v_certificate2_id UUID := '9f4a2b05-18f1-4d9f-9d4e-1b4f1c6a6002';

  v_learner2_id UUID := (SELECT id FROM public.profiles WHERE email = 'learner2@gyanpath.test');
  v_course_digital_literacy UUID := '9f4a2b05-18f1-4d9f-9d4e-1b4f1c6a1001';
  v_course_english          UUID := '9f4a2b05-18f1-4d9f-9d4e-1b4f1c6a1003';
BEGIN
  INSERT INTO public.certificates (id, user_id, course_id, certificate_number, verification_code, score, issued_at)
  VALUES
    (v_certificate1_id, v_learner2_id, v_course_digital_literacy, 'CERT-2024-001', 'VERIFY-' || upper(substr(md5('cert1'), 1, 8)), 95.5, NOW() - INTERVAL '1 day'),
    (v_certificate2_id, v_learner2_id, v_course_english,          'CERT-2024-002', 'VERIFY-' || upper(substr(md5('cert2'), 1, 8)), 88.0, NOW() - INTERVAL '3 days')
  ON CONFLICT (id) DO UPDATE SET
    certificate_number = EXCLUDED.certificate_number,
    verification_code = EXCLUDED.verification_code,
    score = EXCLUDED.score,
    issued_at = EXCLUDED.issued_at;

  RAISE NOTICE 'Sample certificates inserted/updated successfully.';
END;
$$;

