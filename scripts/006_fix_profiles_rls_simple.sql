-- Fix infinite recursion in profiles RLS policies
-- Drop all existing policies that cause circular dependencies

-- Drop existing policies on profiles table
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Group admins can view their group members" ON public.profiles;
DROP POLICY IF EXISTS "Instructors can view learner profiles" ON public.profiles;

-- Drop the helper function if it exists
DROP FUNCTION IF EXISTS public.get_user_role();

-- Create simple, non-recursive policies
-- Policy 1: Users can view their own profile (no recursion - just checks auth.uid())
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

-- Policy 2: Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Policy 3: Users can insert their own profile during signup
CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- For admin access, we'll handle it at the application level
-- or create a separate admin-only view if needed later

-- Ensure RLS is enabled
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
