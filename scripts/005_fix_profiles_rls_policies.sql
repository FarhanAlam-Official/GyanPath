-- Drop the problematic policy that causes infinite recursion
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;

-- Create a function to get user role (bypasses RLS with SECURITY DEFINER)
CREATE OR REPLACE FUNCTION public.get_user_role(user_id UUID)
RETURNS user_role
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_role_result user_role;
BEGIN
  SELECT role INTO user_role_result
  FROM public.profiles
  WHERE id = user_id;
  
  RETURN user_role_result;
END;
$$;

-- Recreate the admin policy using the helper function
CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  USING (public.get_user_role(auth.uid()) = 'admin');

-- Also fix the groups policy to use the helper function
DROP POLICY IF EXISTS "Admins can manage all groups" ON public.groups;

CREATE POLICY "Admins can manage all groups"
  ON public.groups FOR ALL
  USING (public.get_user_role(auth.uid()) = 'admin');

-- Add policy for instructors and group admins to view profiles in their groups
CREATE POLICY "Group admins can view their group members"
  ON public.profiles FOR SELECT
  USING (
    public.get_user_role(auth.uid()) = 'group_admin'
    AND EXISTS (
      SELECT 1 FROM public.group_members gm
      JOIN public.groups g ON g.id = gm.group_id
      WHERE gm.user_id = profiles.id
      AND g.group_admin_id = auth.uid()
    )
  );

-- Add policy for instructors to view learner profiles in their courses
CREATE POLICY "Instructors can view enrolled learners"
  ON public.profiles FOR SELECT
  USING (
    public.get_user_role(auth.uid()) = 'instructor'
    AND EXISTS (
      SELECT 1 FROM public.enrollments e
      JOIN public.courses c ON c.id = e.course_id
      WHERE e.user_id = profiles.id
      AND c.instructor_id = auth.uid()
    )
  );
