-- ============================================================================
-- AUTO-ADMIN ON SIGNUP
-- ============================================================================
-- This makes ANYONE who creates an account automatically an admin
-- Run this in Supabase SQL Editor
-- ============================================================================

-- Step 1: Create a function that sets admin role on new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user_as_admin()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert profile with admin role
  INSERT INTO public.profiles (id, email, name, is_admin, role, country)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    true,  -- Always admin
    'admin',  -- Always admin
    COALESCE(NEW.raw_user_meta_data->>'country', 'GB')
  )
  ON CONFLICT (id) 
  DO UPDATE SET
    is_admin = true,
    role = 'admin',
    updated_at = NOW();
  
  -- Insert admin role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'admin')
  ON CONFLICT (user_id, role) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 2: Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created_admin ON auth.users;

-- Step 3: Create trigger that runs when new user signs up
CREATE TRIGGER on_auth_user_created_admin
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user_as_admin();

-- ============================================================================
-- Step 4: Fix existing users to be admin
-- ============================================================================

-- Make all existing users admin
UPDATE profiles 
SET 
  is_admin = true,
  role = 'admin'
WHERE is_admin = false OR is_admin IS NULL;

-- Add admin role for all existing users
INSERT INTO user_roles (user_id, role)
SELECT id, 'admin' FROM profiles
ON CONFLICT (user_id, role) DO NOTHING;

-- ============================================================================
-- Step 5: Verify the trigger works
-- ============================================================================

-- Check the trigger exists
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created_admin';

-- Check all users are admin
SELECT 
  email,
  is_admin,
  role
FROM profiles
ORDER BY created_at DESC;

-- ============================================================================
-- DONE!
-- ============================================================================
-- Now anyone who signs up at /admin-login will automatically be admin
-- No need to manually set admin role anymore
-- ============================================================================

-- ============================================================================
-- TO REVERT (if you want to disable auto-admin):
-- ============================================================================
-- DROP TRIGGER IF EXISTS on_auth_user_created_admin ON auth.users;
-- DROP FUNCTION IF EXISTS public.handle_new_user_as_admin();
-- ============================================================================
