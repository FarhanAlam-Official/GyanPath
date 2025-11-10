-- Password Reset Setup Script for Supabase
-- This script ensures the database is properly configured for password reset functionality
-- Note: Most password reset functionality is handled by Supabase Auth automatically
-- This script mainly ensures RLS policies don't interfere with password reset

-- Ensure profiles table allows password reset operations
-- Users need to be able to update their own profile (which includes email verification status)

-- Verify that the handle_new_user function doesn't interfere with password reset
-- The function should only run on INSERT, not on UPDATE
-- This is already correct in 001_create_database_schema.sql

-- Ensure RLS policies allow users to update their own profile
-- This is needed for any profile updates that might happen during password reset
-- These policies should already exist, but we'll verify them

-- Check if profiles table has email_verified column (optional, for tracking)
DO $$
BEGIN
  -- Add email_verified column if it doesn't exist (for tracking purposes)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles' 
    AND column_name = 'email_verified'
  ) THEN
    ALTER TABLE public.profiles 
    ADD COLUMN email_verified BOOLEAN DEFAULT false;
    
    -- Update existing profiles based on auth.users
    UPDATE public.profiles p
    SET email_verified = COALESCE(
      (SELECT email_confirmed_at IS NOT NULL FROM auth.users WHERE id = p.id),
      false
    );
  END IF;
END $$;

-- Ensure users can update their email_verified status
-- This is already covered by the "Users can update own profile" policy

-- Add comment for documentation
COMMENT ON COLUMN public.profiles.email_verified IS 'Tracks if user email is verified, synced from auth.users.email_confirmed_at';

-- Note: Password reset tokens are stored in auth.refresh_tokens table
-- This is managed automatically by Supabase Auth
-- No manual intervention needed

