-- ==========================================
-- Reusable Auth System - Database Migrations
-- ==========================================
-- This script contains migration scripts for updating existing installations

-- ==========================================
-- MIGRATION 1: Add moderator fields to existing profiles table
-- ==========================================

-- Add moderator-specific fields if they don't exist
DO $$
BEGIN
  -- Add assigned_sports column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles' 
    AND column_name = 'assigned_sports'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN assigned_sports TEXT[];
  END IF;

  -- Add assigned_venues column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles' 
    AND column_name = 'assigned_venues'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN assigned_venues TEXT[];
  END IF;

  -- Add moderator_notes column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles' 
    AND column_name = 'moderator_notes'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN moderator_notes TEXT;
  END IF;

  -- Add last_login column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles' 
    AND column_name = 'last_login'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN last_login TIMESTAMPTZ;
  END IF;

  -- Add deleted_at column for soft deletes
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles' 
    AND column_name = 'deleted_at'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN deleted_at TIMESTAMPTZ;
  END IF;
END $$;

-- ==========================================
-- MIGRATION 2: Update role constraint to include moderator
-- ==========================================

-- Drop existing role constraint if it exists
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;

-- Add updated role constraint
ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check 
CHECK (role IN ('admin', 'moderator', 'viewer'));

-- ==========================================
-- MIGRATION 3: Create indexes if they don't exist
-- ==========================================

CREATE INDEX IF NOT EXISTS profiles_role_idx ON public.profiles(role);
CREATE INDEX IF NOT EXISTS profiles_deleted_at_idx ON public.profiles(deleted_at);
CREATE INDEX IF NOT EXISTS profiles_last_login_idx ON public.profiles(last_login);

-- ==========================================
-- MIGRATION 4: Update existing admin users
-- ==========================================

-- Function to migrate existing admin users
CREATE OR REPLACE FUNCTION public.migrate_admin_users()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  updated_count INTEGER;
BEGIN
  -- Update any users with admin-like email patterns to have admin role
  UPDATE public.profiles 
  SET role = 'admin'
  WHERE (
    email ILIKE '%admin%' OR 
    email ILIKE '%administrator%' OR
    email ILIKE '%root%'
  ) AND role != 'admin';
  
  GET DIAGNOSTICS updated_count = ROW_COUNT;
  
  RETURN 'Updated ' || updated_count || ' users to admin role based on email patterns';
END;
$$;

-- ==========================================
-- MIGRATION 5: Cleanup old functions and policies
-- ==========================================

-- Drop old function versions that might conflict
DROP FUNCTION IF EXISTS public.is_admin_user(UUID);
DROP FUNCTION IF EXISTS public.is_moderator_user(UUID);

-- Drop old policies that might conflict
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can manage profiles" ON public.profiles;
DROP POLICY IF EXISTS "admins can update profiles" ON public.profiles;
DROP POLICY IF EXISTS "users can update own profile" ON public.profiles;

-- ==========================================
-- VERIFICATION FUNCTIONS
-- ==========================================

-- Function to verify migration status
CREATE OR REPLACE FUNCTION public.verify_auth_migration()
RETURNS TABLE (
  component TEXT,
  status TEXT,
  details TEXT
)
LANGUAGE plpgsql
AS $$
BEGIN
  -- Check profiles table structure
  RETURN QUERY
  SELECT 
    'profiles_table'::TEXT as component,
    CASE 
      WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles')
      THEN 'OK'
      ELSE 'MISSING'
    END as status,
    'Profiles table exists'::TEXT as details;

  -- Check moderator columns
  RETURN QUERY
  SELECT 
    'moderator_columns'::TEXT as component,
    CASE 
      WHEN EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' 
        AND column_name IN ('assigned_sports', 'assigned_venues', 'moderator_notes')
      )
      THEN 'OK'
      ELSE 'MISSING'
    END as status,
    'Moderator-specific columns exist'::TEXT as details;

  -- Check auth functions
  RETURN QUERY
  SELECT 
    'auth_functions'::TEXT as component,
    CASE 
      WHEN EXISTS (
        SELECT 1 FROM information_schema.routines 
        WHERE routine_name IN ('is_admin_safe', 'is_moderator_safe', 'get_user_role_safe')
      )
      THEN 'OK'
      ELSE 'MISSING'
    END as status,
    'Authentication functions exist'::TEXT as details;

  -- Check RLS policies
  RETURN QUERY
  SELECT 
    'rls_policies'::TEXT as component,
    CASE 
      WHEN EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'profiles' 
        AND policyname LIKE '%_policy'
      )
      THEN 'OK'
      ELSE 'MISSING'
    END as status,
    'Row Level Security policies exist'::TEXT as details;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.verify_auth_migration() TO authenticated;