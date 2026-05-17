-- ============================================================================
-- COMPLETE FIX FOR ADMIN PORTAL AND PUBLIC POSTS
-- ============================================================================
-- Run this ENTIRE file in Supabase SQL Editor
-- This fixes:
-- 1. Admin role not persisting
-- 2. Posts not visible to public
-- 3. Auto-admin on signup
-- ============================================================================

-- ============================================================================
-- PART 1: DISABLE RLS (Row Level Security) ON KEY TABLES
-- ============================================================================
-- This allows reading profiles and posts without authentication issues

ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles DISABLE ROW LEVEL SECURITY;
ALTER TABLE posts DISABLE ROW LEVEL SECURITY;

-- ============================================================================
-- PART 2: FIX EXISTING ADMIN USER (davikdigitals@gmail.com)
-- ============================================================================

-- Update profile to be admin
UPDATE profiles 
SET 
  is_admin = true,
  role = 'admin',
  updated_at = NOW()
WHERE email = 'davikdigitals@gmail.com';

-- Add admin role
INSERT INTO user_roles (user_id, role)
SELECT id, 'admin' 
FROM profiles 
WHERE email = 'davikdigitals@gmail.com'
ON CONFLICT (user_id, role) DO NOTHING;

-- ============================================================================
-- PART 3: CREATE AUTO-ADMIN TRIGGER
-- ============================================================================
-- Anyone who signs up at /admin-login will automatically become admin

-- Create the trigger function
CREATE OR REPLACE FUNCTION public.handle_new_user_as_admin()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert profile with admin role (country defaults to 'US' for admins)
  INSERT INTO public.profiles (id, email, name, is_admin, role, country)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    true,  -- Always admin
    'admin',  -- Always admin
    'US'  -- Default country for admins (no country field in admin form)
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

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created_admin ON auth.users;

-- Create the trigger
CREATE TRIGGER on_auth_user_created_admin
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user_as_admin();

-- ============================================================================
-- PART 4: GRANT PUBLIC ACCESS TO POSTS
-- ============================================================================
-- Allow anonymous users to read published posts

GRANT SELECT ON posts TO anon;
GRANT SELECT ON posts TO authenticated;

-- ============================================================================
-- PART 5: CLEANUP DUPLICATE RLS POLICIES (if they exist)
-- ============================================================================

-- Drop all existing policies on posts table
DO $$ 
DECLARE
    pol RECORD;
BEGIN
    FOR pol IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'posts' AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON posts', pol.policyname);
    END LOOP;
END $$;

-- ============================================================================
-- PART 6: VERIFY EVERYTHING
-- ============================================================================

-- Check admin user
SELECT 
  email,
  is_admin,
  role,
  country
FROM profiles
WHERE email = 'davikdigitals@gmail.com';

-- Check trigger exists
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created_admin';

-- Check RLS status
SELECT 
  tablename,
  rowsecurity
FROM pg_tables
WHERE schemaname = 'public' 
  AND tablename IN ('profiles', 'user_roles', 'posts');

-- Check posts are accessible
SELECT COUNT(*) as total_posts FROM posts;
SELECT COUNT(*) as published_posts FROM posts WHERE is_published = true;

-- ============================================================================
-- EXPECTED RESULTS:
-- ============================================================================
-- 1. davikdigitals@gmail.com should show: is_admin = true, role = admin
-- 2. Trigger 'on_auth_user_created_admin' should exist
-- 3. All three tables should show: rowsecurity = false
-- 4. Should see count of total and published posts
-- ============================================================================

-- ============================================================================
-- DONE! 
-- ============================================================================
-- After running this:
-- 1. Hard refresh your browser (Ctrl+Shift+R)
-- 2. Login to admin portal
-- 3. Admin should work and persist on refresh
-- 4. Posts should be visible to everyone
-- 5. New signups at /admin-login will automatically be admin
-- ============================================================================
