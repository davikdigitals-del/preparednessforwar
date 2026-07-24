-- ============================================================================
-- FIX ROLE ASSIGNMENT
-- ============================================================================
-- Run this in Supabase SQL Editor.
-- Admin accounts: ONLY created via /admin-login (passes is_admin=true in metadata).
-- All other signups (Google, Apple, Discord, /signup): become members.
-- ============================================================================

-- Step 1: Remove ALL old triggers and functions
DROP TRIGGER IF EXISTS on_auth_user_created_admin ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user_as_admin();
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Step 2: Create the correct trigger function
-- Reads is_admin from signup metadata — only /admin-login passes is_admin=true
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_is_admin boolean;
  v_role     text;
BEGIN
  v_is_admin := COALESCE((NEW.raw_user_meta_data->>'is_admin')::boolean, false);
  v_role     := CASE WHEN v_is_admin THEN 'admin' ELSE 'member' END;

  -- Insert profile — on conflict just update role fields (no updated_at dependency)
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
  ON CONFLICT (id) DO UPDATE
    SET is_admin = EXCLUDED.is_admin,
        role     = EXCLUDED.role;

  -- Insert role record
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, v_role)
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
-- Step 4: Fix existing users wrongly promoted to admin.
-- Replace 'your-admin@example.com' with your REAL admin email(s).
-- ============================================================================

UPDATE public.profiles
SET is_admin = false,
    role     = 'member'
WHERE email NOT IN (
  'your-admin@example.com'    -- ← put your real admin email here
);

DELETE FROM public.user_roles
WHERE role = 'admin'
  AND user_id IN (
    SELECT id FROM public.profiles
    WHERE email NOT IN (
      'your-admin@example.com'  -- ← same email as above
    )
  );

-- Step 5: Verify result
SELECT email, is_admin, role FROM public.profiles ORDER BY created_at DESC;
