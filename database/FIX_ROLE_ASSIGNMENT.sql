-- ============================================================================
-- FIX ROLE ASSIGNMENT
-- ============================================================================
-- HOW IT WORKS:
--   /admin-login  → signup passes { is_admin: true } in metadata → ADMIN
--   /signup       → no metadata flag                             → MEMBER
--   Google/Apple/Discord                                         → MEMBER
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
  -- Only admin-login page passes is_admin=true in metadata
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

-- ============================================================================
-- Step 4: Fix existing accounts that were wrongly made admin by the old trigger.
-- This demotes everyone to member EXCEPT those who signed up via /admin-login.
-- We detect admin-login signups by the is_admin flag in their raw_user_meta_data.
-- ============================================================================

UPDATE public.profiles p
SET is_admin = false,
    role     = 'member'
WHERE p.id IN (
  SELECT au.id
  FROM auth.users au
  WHERE COALESCE((au.raw_user_meta_data->>'is_admin')::boolean, false) = false
);

DELETE FROM public.user_roles
WHERE role = 'admin'
  AND user_id IN (
    SELECT au.id
    FROM auth.users au
    WHERE COALESCE((au.raw_user_meta_data->>'is_admin')::boolean, false) = false
  );

-- ============================================================================
-- Step 5: Verify — admins should only be those who used /admin-login
-- ============================================================================
SELECT p.email, p.is_admin, p.role, au.raw_user_meta_data->>'is_admin' AS signed_up_as_admin
FROM public.profiles p
JOIN auth.users au ON au.id = p.id
ORDER BY p.role DESC, p.email;
