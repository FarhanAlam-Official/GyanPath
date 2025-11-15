-- ============================================================================
-- Insert sample groups and memberships
-- ============================================================================
-- Requires:
--   - common/001_helpers.sql
--   - profiles/002_insert_profiles_sample.sql
-- ============================================================================

DO $$
DECLARE
  v_group_id        UUID := '8c8f6b4a-9e5a-4401-9010-1c0fd3b31001';
  v_group_admin_id  UUID := (SELECT id FROM public.profiles WHERE email = 'groupadmin1@gyanpath.test');
  v_member_learner1 UUID := (SELECT id FROM public.profiles WHERE email = 'learner1@gyanpath.test');
  v_member_learner2 UUID := (SELECT id FROM public.profiles WHERE email = 'learner2@gyanpath.test');
  v_member_learner3 UUID := (SELECT id FROM public.profiles WHERE email = 'learner3@gyanpath.test');
BEGIN
  IF v_group_admin_id IS NULL THEN
    RAISE EXCEPTION 'Profiles must be inserted before groups (group admin missing).';
  END IF;

  INSERT INTO public.groups (id, name, description, group_admin_id)
  VALUES (
    v_group_id,
    'Rural Education Initiative',
    'A group focused on providing education to rural communities.',
    v_group_admin_id
  )
  ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    group_admin_id = EXCLUDED.group_admin_id;

  INSERT INTO public.group_members (group_id, user_id)
  VALUES
    (v_group_id, v_member_learner1),
    (v_group_id, v_member_learner2),
    (v_group_id, v_member_learner3)
  ON CONFLICT (group_id, user_id) DO NOTHING;

  RAISE NOTICE 'Sample group and memberships inserted/updated successfully.';
END;
$$;

