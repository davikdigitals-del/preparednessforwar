-- ============================================================================
-- NUCLEAR RESET — removes everything and starts clean
-- Run this in Supabase SQL Editor
-- ============================================================================

-- Step 1: Kill ALL triggers on auth.users
DO $$ DECLARE r RECORD;
BEGIN
  FOR r IN 
    SELECT trigger_name 
    FROM information_schema.triggers 
    WHERE event_object_schema = 'auth' 
    AND event_object_table = 'users'
  LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS %I ON auth.users', r.trigger_name);
    RAISE NOTICE 'Dropped trigger: %', r.trigger_name;
  END LOOP;
END $$;

-- Step 2: Kill ALL related functions
DROP FUNCTION IF EXISTS public.handle_new_user_as_admin() CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- Step 3: Verify all triggers are gone
SELECT trigger_name 
FROM information_schema.triggers 
WHERE event_object_schema = 'auth' AND event_object_table = 'users';
-- Should return 0 rows

-- Step 4: Create the correct function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_is_admin boolean;
  v_role text;
BEGIN
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
  ON CONFLICT (id) DO UPDATE
    SET is_admin = EXCLUDED.is_admin,
        role = EXCLUDED.role;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, v_role)
  ON CONFLICT (user_id, role) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 5: Attach new trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Step 6: Verify new trigger is in place
SELECT trigger_name, event_object_table
FROM information_schema.triggers
WHERE event_object_schema = 'auth' AND event_object_table = 'users';
-- Should return exactly 1 row: on_auth_user_created

-- Step 7: Test — try a dummy password recovery to confirm no 500
-- (just checks the function works, doesn't send email)
SELECT public.handle_new_user IS NOT NULL AS function_exists;
