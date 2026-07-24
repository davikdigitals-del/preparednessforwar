-- ============================================================================
-- FIX ROLE ASSIGNMENT
-- ============================================================================
-- Run this in Supabase SQL Editor.
-- Admin accounts: created via /admin-login which passes is_admin=true in metadata.
-- All other signups (Google, Apple, Discord, /signup): become members.
-- ============================================================================

-- Step 1: Remove old triggers/functions
DROP TRIGGER IF EXISTS on_auth_user_created_admin ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user_as_admin();
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Step 2: Smart trigger — reads is_admin flag from signup metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_is_admin boolean;
  v_role text;
BEGIN
  -- Check if the signup explicitly requested admin role via metadata
  v_is_admin := COALESCE((NEW.raw_user_meta_data->>'is_admin')::boolean, false);
  v_role := CASE WHEN v_is_admin THEN 'admin' ELSE 'member' END;

  INSERT INTO public.profiles (id, email, name, is_admin, role, country)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'name',
      split_part(NEW.email, '@', 1)
    ),
    v_is_admin,
    v_role,
    COALESCE(NEW.raw_user_meta_data->>'country', 'GB')
  )
  ON CONFLICT (id) DO UPDATE SET
    is_admin = EXCLUDED.is_admin,
    role = EXCLUDED.role,
    updated_at = NOW();

  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, v_role)
  ON CONFLICT (user_id, role) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 3: Attach trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- Step 4: Fix existing users wrongly set as admin.
-- Replace 'your-admin@example.com' with your actual admin email(s).
-- ============================================================================

UPDATE public.profiles
SET is_admin = false, role = 'member'
WHERE email NOT IN (
  'your-admin@example.com'   -- ← replace with your real admin email(s)
);

DELETE FROM public.user_roles
WHERE role = 'admin'
  AND user_id IN (
    SELECT id FROM public.profiles
    WHERE email NOT IN (
      'your-admin@example.com'   -- ← same emails as above
    )
  );

-- Step 5: Verify
SELECT email, is_admin, role FROM public.profiles ORDER BY created_at DESC;
