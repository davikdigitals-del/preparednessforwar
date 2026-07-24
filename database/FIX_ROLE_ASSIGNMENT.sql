-- ============================================================================
-- FIX ROLE ASSIGNMENT
-- ============================================================================
-- Run this in Supabase SQL Editor.
-- This removes the auto-admin trigger and replaces it with a member trigger.
-- Admin accounts are ONLY created via the /admin-login page (explicitly).
-- ============================================================================

-- Step 1: Remove the auto-admin trigger and function
DROP TRIGGER IF EXISTS on_auth_user_created_admin ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user_as_admin();
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Step 2: Create a function that creates new users as MEMBERS by default
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, is_admin, role, country)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    false,     -- NOT admin by default
    'member',  -- Default role
    COALESCE(NEW.raw_user_meta_data->>'country', 'GB')
  )
  ON CONFLICT (id) DO NOTHING;  -- Don't overwrite if profile already set (e.g. admin registration)

  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'member')
  ON CONFLICT (user_id, role) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 3: Attach trigger to auth.users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- Step 4: Fix existing users who were wrongly made admin via the old trigger.
-- IMPORTANT: Replace 'your-admin@example.com' with your real admin email(s)
-- before running this block. Everyone else will be demoted to member.
-- ============================================================================

-- Demote everyone to member first
UPDATE public.profiles
SET is_admin = false, role = 'member'
WHERE email NOT IN (
  'your-admin@example.com'   -- ← replace with real admin email(s)
);

-- Remove admin role from user_roles for non-admins
DELETE FROM public.user_roles
WHERE role = 'admin'
  AND user_id IN (
    SELECT id FROM public.profiles
    WHERE email NOT IN (
      'your-admin@example.com'   -- ← same emails as above
    )
  );

-- ============================================================================
-- Step 5: Verify
-- ============================================================================
SELECT email, is_admin, role FROM public.profiles ORDER BY created_at DESC;
