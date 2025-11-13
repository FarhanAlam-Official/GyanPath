-- ==========================================
-- Reusable Auth System - Database Setup Script
-- ==========================================
-- This script sets up the complete database schema and functions
-- for the reusable authentication system
-- 
-- Run this script in your Supabase SQL Editor

BEGIN;

-- ==========================================
-- CREATE PROFILES TABLE
-- ==========================================

-- Create profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  role TEXT NOT NULL DEFAULT 'viewer' CHECK (role IN ('admin', 'moderator', 'viewer')),
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_login TIMESTAMPTZ,
  deleted_at TIMESTAMPTZ,
  -- Additional moderator fields
  assigned_sports TEXT[],
  assigned_venues TEXT[],
  moderator_notes TEXT
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS profiles_email_idx ON public.profiles(email);
CREATE INDEX IF NOT EXISTS profiles_role_idx ON public.profiles(role);
CREATE INDEX IF NOT EXISTS profiles_deleted_at_idx ON public.profiles(deleted_at);

-- ==========================================
-- CREATE HELPER FUNCTIONS
-- ==========================================

-- Function to check if a user is admin without causing RLS recursion
CREATE OR REPLACE FUNCTION public.is_admin_safe(user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_role TEXT;
BEGIN
  IF user_id IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Get the role directly from profiles table
  SELECT role INTO user_role
  FROM public.profiles
  WHERE id = user_id AND deleted_at IS NULL;
  
  RETURN COALESCE(user_role = 'admin', FALSE);
EXCEPTION
  WHEN OTHERS THEN
    RETURN FALSE;
END;
$$;

-- Function to check if a user is moderator or admin
CREATE OR REPLACE FUNCTION public.is_moderator_safe(user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_role TEXT;
BEGIN
  IF user_id IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Get the role directly from profiles table
  SELECT role INTO user_role
  FROM public.profiles
  WHERE id = user_id AND deleted_at IS NULL;
  
  RETURN COALESCE(user_role IN ('moderator', 'admin'), FALSE);
EXCEPTION
  WHEN OTHERS THEN
    RETURN FALSE;
END;
$$;

-- Function to get user role safely
CREATE OR REPLACE FUNCTION public.get_user_role_safe(user_id UUID DEFAULT auth.uid())
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_role TEXT;
BEGIN
  IF user_id IS NULL THEN
    RETURN 'viewer';
  END IF;
  
  SELECT role INTO user_role
  FROM public.profiles
  WHERE id = user_id AND deleted_at IS NULL;
  
  RETURN COALESCE(user_role, 'viewer');
EXCEPTION
  WHEN OTHERS THEN
    RETURN 'viewer';
END;
$$;

-- Function to get user profile safely
CREATE OR REPLACE FUNCTION public.get_user_profile(user_id UUID DEFAULT auth.uid())
RETURNS TABLE (
  id UUID,
  email TEXT,
  full_name TEXT,
  role TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  last_login TIMESTAMPTZ,
  is_active BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.email,
    p.full_name,
    p.role,
    p.created_at,
    p.updated_at,
    p.last_login,
    (p.deleted_at IS NULL) as is_active
  FROM public.profiles p
  WHERE p.id = user_id AND p.deleted_at IS NULL;
END;
$$;

-- Function to validate authentication state
CREATE OR REPLACE FUNCTION public.validate_auth_state()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_user_id UUID;
  user_role TEXT;
  is_valid BOOLEAN;
  result JSONB;
BEGIN
  -- Get current user
  current_user_id := auth.uid();
  
  IF current_user_id IS NULL THEN
    RETURN jsonb_build_object(
      'authenticated', false,
      'user_id', null,
      'role', 'anonymous',
      'valid', false
    );
  END IF;
  
  -- Get user role safely
  user_role := public.get_user_role_safe(current_user_id);
  
  -- Check if user is valid
  is_valid := EXISTS(
    SELECT 1 FROM public.profiles 
    WHERE id = current_user_id AND deleted_at IS NULL
  );
  
  result := jsonb_build_object(
    'authenticated', true,
    'user_id', current_user_id,
    'role', user_role,
    'valid', is_valid,
    'is_admin', user_role = 'admin',
    'is_moderator', user_role IN ('moderator', 'admin'),
    'timestamp', NOW()
  );
  
  RETURN result;
END;
$$;

-- Function to get moderator assignments (placeholder)
CREATE OR REPLACE FUNCTION public.get_moderator_assignments(p_user_id UUID)
RETURNS TABLE (
  sport TEXT,
  venue TEXT,
  assigned_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- This is a placeholder implementation
  -- You can customize this based on your specific requirements
  RETURN QUERY
  SELECT 
    unnest(assigned_sports) as sport,
    unnest(assigned_venues) as venue,
    created_at as assigned_at
  FROM public.profiles
  WHERE id = p_user_id 
    AND deleted_at IS NULL
    AND role IN ('moderator', 'admin');
END;
$$;

-- ==========================================
-- CREATE TRIGGERS
-- ==========================================

-- Function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', ''),
    COALESCE(new.raw_user_meta_data->>'role', 'viewer')
  );
  RETURN new;
END;
$$;

-- Create trigger for new user registration
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Function to handle profile updates
CREATE OR REPLACE FUNCTION public.handle_profile_update()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Create trigger for profile updates
DROP TRIGGER IF EXISTS on_profile_updated ON public.profiles;
CREATE TRIGGER on_profile_updated
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE PROCEDURE public.handle_profile_update();

-- ==========================================
-- ENABLE ROW LEVEL SECURITY
-- ==========================================

-- Enable RLS on profiles table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "profiles_select_policy" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_policy" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_policy" ON public.profiles;
DROP POLICY IF EXISTS "profiles_delete_policy" ON public.profiles;

-- 1. SELECT Policy: Allow users to view active profiles
CREATE POLICY "profiles_select_policy"
  ON public.profiles FOR SELECT
  USING (deleted_at IS NULL);

-- 2. INSERT Policy: Allow authenticated users to insert their own profile
CREATE POLICY "profiles_insert_policy"
  ON public.profiles FOR INSERT
  WITH CHECK (
    auth.uid() = id AND 
    deleted_at IS NULL
  );

-- 3. UPDATE Policy: Users can update their own profile, admins can update any
CREATE POLICY "profiles_update_policy"
  ON public.profiles FOR UPDATE
  USING (
    deleted_at IS NULL AND (
      auth.uid() = id OR 
      public.is_admin_safe(auth.uid())
    )
  )
  WITH CHECK (
    deleted_at IS NULL AND (
      auth.uid() = id OR 
      public.is_admin_safe(auth.uid())
    )
  );

-- 4. DELETE Policy: Only admins can delete profiles (soft delete)
CREATE POLICY "profiles_delete_policy"
  ON public.profiles FOR UPDATE
  USING (
    public.is_admin_safe(auth.uid()) AND
    deleted_at IS NULL
  )
  WITH CHECK (
    public.is_admin_safe(auth.uid())
  );

-- ==========================================
-- GRANT PERMISSIONS
-- ==========================================

-- Grant usage on schema
GRANT USAGE ON SCHEMA public TO anon, authenticated;

-- Grant permissions on profiles table
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT SELECT ON public.profiles TO anon;

-- Grant execute permissions on functions
GRANT EXECUTE ON FUNCTION public.is_admin_safe(UUID) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.is_moderator_safe(UUID) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.get_user_role_safe(UUID) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.get_user_profile(UUID) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.validate_auth_state() TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.get_moderator_assignments(UUID) TO authenticated;

-- ==========================================
-- CREATE UTILITY VIEWS (OPTIONAL)
-- ==========================================

-- View for active profiles only
CREATE OR REPLACE VIEW public.active_profiles AS
SELECT 
  id,
  email,
  full_name,
  role,
  avatar_url,
  created_at,
  updated_at,
  last_login,
  assigned_sports,
  assigned_venues
FROM public.profiles 
WHERE deleted_at IS NULL;

-- Grant select permission on view
GRANT SELECT ON public.active_profiles TO authenticated, anon;

-- ==========================================
-- CREATE TEST DATA (OPTIONAL)
-- ==========================================

-- Function to create test admin user (for development only)
CREATE OR REPLACE FUNCTION public.create_test_admin(
  admin_email TEXT DEFAULT 'admin@example.com',
  admin_name TEXT DEFAULT 'System Administrator'
)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  admin_id UUID;
BEGIN
  -- Generate a UUID for the admin user
  admin_id := gen_random_uuid();
  
  -- Insert into profiles table (this would normally be done by the trigger)
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (admin_id, admin_email, admin_name, 'admin')
  ON CONFLICT (email) DO UPDATE SET
    role = 'admin',
    full_name = admin_name,
    updated_at = NOW();
  
  RETURN 'Test admin user created/updated with email: ' || admin_email;
EXCEPTION
  WHEN OTHERS THEN
    RETURN 'Error creating test admin: ' || SQLERRM;
END;
$$;

COMMIT;

-- ==========================================
-- VERIFICATION QUERIES
-- ==========================================

-- Uncomment these queries to verify the setup:

-- -- Check if profiles table exists and has correct structure
-- SELECT column_name, data_type, is_nullable, column_default
-- FROM information_schema.columns
-- WHERE table_schema = 'public' AND table_name = 'profiles'
-- ORDER BY ordinal_position;

-- -- Check if functions exist
-- SELECT routine_name, routine_type
-- FROM information_schema.routines
-- WHERE routine_schema = 'public' 
--   AND routine_name LIKE '%admin%' OR routine_name LIKE '%moderator%' OR routine_name LIKE '%profile%'
-- ORDER BY routine_name;

-- -- Check if policies exist
-- SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
-- FROM pg_policies
-- WHERE schemaname = 'public' AND tablename = 'profiles';

-- -- Test the functions
-- SELECT public.validate_auth_state();
-- SELECT public.get_user_role_safe(null);
-- SELECT public.is_admin_safe(null);
-- SELECT public.is_moderator_safe(null);