-- Diagnose 500 Errors
-- Run this to see what's causing the database errors

-- 1. Check if profiles table exists and its structure
SELECT 
  'profiles columns' as info,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'profiles'
ORDER BY ordinal_position;

-- 2. Check if user_roles table exists and its structure
SELECT 
  'user_roles columns' as info,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'user_roles'
ORDER BY ordinal_position;

-- 3. Check constraints on profiles
SELECT 
  'profiles constraints' as info,
  constraint_name,
  constraint_type
FROM information_schema.table_constraints 
WHERE table_name = 'profiles';

-- 4. Check constraints on user_roles
SELECT 
  'user_roles constraints' as info,
  constraint_name,
  constraint_type
FROM information_schema.table_constraints 
WHERE table_name = 'user_roles';

-- 5. Try to insert a test profile (this will show the actual error)
-- First, let's see if we can select from profiles
SELECT 
  'Can select from profiles?' as test,
  COUNT(*) as row_count
FROM profiles;

-- 6. Check RLS status
SELECT 
  'RLS status' as info,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('profiles', 'user_roles');

-- 7. List all policies
SELECT 
  'Current policies' as info,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies 
WHERE schemaname = 'public'
  AND tablename IN ('profiles', 'user_roles')
ORDER BY tablename, policyname;
