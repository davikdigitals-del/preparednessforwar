-- ============================================================================
-- FIX ROLE ASSIGNMENT
-- ============================================================================
-- HOW IT WORKS:
--   /admin-login  → signup passes { is_admin: true } in metadata → ADMIN
--   /signup       → no metadata flag                             → MEMBER
--   Google / Apple / Discord                                     → MEMBER
--
-- RUN THIS in Supabase SQL Editor to fix the broken trigger causing 500 errors.
-- ============================================================================

-- Step 1: Remove ALL old triggers and functions
DROP TRIGGER IF EXISTS on_auth_user_created_admin ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user_as_admin();
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Step 2: Create the correct trigger function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_is_admin boolean;
  v_role     text;
BEGIN
  -- Only /admin-login passes is_admin=true in metadata — everyone else is member
  v_is_admin := COALESCE((NEW.raw_user_meta_data->>'is_admin')::boolean, false);
  v_role     := CASE WHEN v_is_admin THEN 'admin' ELSE 'member' END;

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

-- Step 4: Verify — check the trigger is in place
SELECT trigger_name, event_manipulation, event_object_table
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';
