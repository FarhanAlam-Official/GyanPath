-- ============================================================================
-- Insert sample profiles
-- ============================================================================
-- Requires: common/001_helpers.sql
-- Inserts profiles for predefined auth users.
-- ============================================================================

DO $$
DECLARE
  v_admin_id        UUID := (SELECT id FROM auth.users WHERE email = 'admin@gyanpath.test' LIMIT 1);
  v_group_admin_id  UUID := (SELECT id FROM auth.users WHERE email = 'groupadmin1@gyanpath.test' LIMIT 1);
  v_instructor1_id  UUID := (SELECT id FROM auth.users WHERE email = 'instructor1@gyanpath.test' LIMIT 1);
  v_instructor2_id  UUID := (SELECT id FROM auth.users WHERE email = 'instructor2@gyanpath.test' LIMIT 1);
  v_learner1_id     UUID := (SELECT id FROM auth.users WHERE email = 'learner1@gyanpath.test' LIMIT 1);
  v_learner2_id     UUID := (SELECT id FROM auth.users WHERE email = 'learner2@gyanpath.test' LIMIT 1);
  v_learner3_id     UUID := (SELECT id FROM auth.users WHERE email = 'learner3@gyanpath.test' LIMIT 1);
BEGIN
  IF v_admin_id IS NULL THEN
    RAISE EXCEPTION 'Missing auth user admin@gyanpath.test. Create this user before running sample data.';
  END IF;
  IF v_group_admin_id IS NULL THEN
    RAISE EXCEPTION 'Missing auth user groupadmin1@gyanpath.test. Create this user before running sample data.';
  END IF;
  IF v_instructor1_id IS NULL THEN
    RAISE EXCEPTION 'Missing auth user instructor1@gyanpath.test. Create this user before running sample data.';
  END IF;
  IF v_instructor2_id IS NULL THEN
    RAISE EXCEPTION 'Missing auth user instructor2@gyanpath.test. Create this user before running sample data.';
  END IF;
  IF v_learner1_id IS NULL THEN
    RAISE EXCEPTION 'Missing auth user learner1@gyanpath.test. Create this user before running sample data.';
  END IF;
  IF v_learner2_id IS NULL THEN
    RAISE EXCEPTION 'Missing auth user learner2@gyanpath.test. Create this user before running sample data.';
  END IF;
  IF v_learner3_id IS NULL THEN
    RAISE EXCEPTION 'Missing auth user learner3@gyanpath.test. Create this user before running sample data.';
  END IF;

  PERFORM sample_insert_profile(v_admin_id,       'admin@gyanpath.test',       'Admin User',         'admin',       '+977-9800000001', NULL);
  PERFORM sample_insert_profile(v_group_admin_id, 'groupadmin1@gyanpath.test', 'School Admin',       'group_admin', '+977-9800000007', NULL);
  PERFORM sample_insert_profile(v_instructor1_id, 'instructor1@gyanpath.test', 'Dr. Sarah Johnson',  'instructor',  '+977-9800000002', NULL);
  PERFORM sample_insert_profile(v_instructor2_id, 'instructor2@gyanpath.test', 'Prof. Ram Shrestha', 'instructor',  '+977-9800000003', NULL);
  PERFORM sample_insert_profile(v_learner1_id,    'learner1@gyanpath.test',    'Amit Kumar',         'learner',     '+977-9800000004', NULL);
  PERFORM sample_insert_profile(v_learner2_id,    'learner2@gyanpath.test',    'Priya Sharma',       'learner',     '+977-9800000005', NULL);
  PERFORM sample_insert_profile(v_learner3_id,    'learner3@gyanpath.test',    'Raj Thapa',          'learner',     '+977-9800000006', NULL);

  RAISE NOTICE 'Sample profiles inserted/updated successfully.';
END;
$$;

