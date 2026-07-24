-- ============================================================================
-- REMOVE AUTO-ADMIN TRIGGER
-- ============================================================================
-- This removes the trigger that makes everyone an admin on signup
-- Run this in Supabase SQL Editor to fix the auto-admin issue
-- ============================================================================

-- Step 1: Drop the auto-admin trigger
DROP TRIGGER IF EXISTS on_auth_user_created_admin ON auth.users;

-- Step 2: Drop the auto-admin function
DROP FUNCTION IF EXISTS public.handle_new_user_as_admin();

-- ============================================================================
-- Step 3: Create proper member signup trigger
-- ============================================================================

-- Function to create normal member profiles on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert profile with member role (default)
  INSERT INTO public.profiles (id, email, name, is_admin, role, country)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    false,  -- NOT admin by default
    'member',  -- Default to member
    COALESCE(NEW.raw_user_meta_data->>'country', 'US')  -- Get country from metadata or default to US
  )
  ON CONFLICT (id) DO NOTHING;
  
  -- Insert member role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'member')
  ON CONFLICT (user_id, role) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for normal member signups
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- Step 4: (Optional) Remove admin status from existing non-admin users
-- ============================================================================
-- Uncomment if you want to demote everyone back to members:
-- UPDATE profiles 
-- SET 
--   is_admin = false,
--   role = 'member'
-- WHERE email NOT IN ('your-actual-admin@example.com');
--
-- DELETE FROM user_roles WHERE role = 'admin' AND user_id IN (
--   SELECT id FROM profiles WHERE email NOT IN ('your-actual-admin@example.com')
-- );

-- ============================================================================
-- Step 5: Verify the changes
-- ============================================================================

-- Check the new trigger exists
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';

-- Check current users
SELECT 
  email,
  is_admin,
  role
FROM profiles
ORDER BY created_at DESC;

-- ============================================================================
-- DONE!
-- ============================================================================
-- Now new signups (Google, Apple, Discord, email) will create MEMBER accounts
-- To manually make someone an admin, update their profile:
-- 
-- UPDATE profiles SET is_admin = true, role = 'admin' WHERE email = 'admin@example.com';
-- INSERT INTO user_roles (user_id, role) 
-- SELECT id, 'admin' FROM profiles WHERE email = 'admin@example.com'
-- ON CONFLICT DO NOTHING;
-- ============================================================================
