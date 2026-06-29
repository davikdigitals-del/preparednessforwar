-- Quick Verification Script for Admin Setup
-- Run this in Supabase SQL Editor to check if everything is configured correctly

-- ============================================
-- 1. CHECK TABLES EXIST
-- ============================================
SELECT 
  '1. TABLES CHECK' as section,
  '' as item,
  '' as status;

SELECT 
  'Tables' as section,
  table_name as item,
  '✅ EXISTS' as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('profiles', 'user_roles')
ORDER BY table_name;

-- ============================================
-- 2. CHECK PROFILES COLUMNS
-- ============================================
SELECT 
  '2. PROFILES COLUMNS' as section,
  '' as item,
  '' as status;

SELECT 
  'profiles' as section,
  column_name as item,
  CASE 
    WHEN column_name IN ('is_admin', 'role') THEN '✅ REQUIRED'
    ELSE '✓ exists'
  END as status
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'profiles'
ORDER BY 
  CASE 
    WHEN column_name IN ('is_admin', 'role') THEN 0
    ELSE 1
  END,
  column_name;

-- ============================================
-- 3. CHECK USER_ROLES COLUMNS
-- ============================================
SELECT 
  '3. USER_ROLES COLUMNS' as section,
  '' as item,
  '' as status;

SELECT 
  'user_roles' as section,
  column_name as item,
  '✓ exists' as status
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'user_roles'
ORDER BY ordinal_position;

-- ============================================
-- 4. CHECK RLS POLICIES
-- ============================================
SELECT 
  '4. RLS POLICIES' as section,
  '' as item,
  '' as status;

SELECT 
  'RLS Policies' as section,
  tablename || '.' || policyname as item,
  '✅ ACTIVE' as status
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename IN ('profiles', 'user_roles')
ORDER BY tablename, policyname;

-- ============================================
-- 5. CHECK FUNCTIONS
-- ============================================
SELECT 
  '5. FUNCTIONS' as section,
  '' as item,
  '' as status;

SELECT 
  'Functions' as section,
  routine_name as item,
  CASE 
    WHEN routine_name IN ('is_admin', 'bootstrap_first_admin') THEN '✅ REQUIRED'
    ELSE '✓ exists'
  END as status
FROM information_schema.routines 
WHERE routine_schema = 'public'
  AND routine_name IN ('is_admin', 'bootstrap_first_admin')
ORDER BY routine_name;

-- ============================================
-- 6. CHECK TRIGGERS
-- ============================================
SELECT 
  '6. TRIGGERS' as section,
  '' as item,
  '' as status;

SELECT 
  'Triggers' as section,
  trigger_name as item,
  '✅ ACTIVE on ' || event_object_table as status
FROM information_schema.triggers 
WHERE trigger_schema = 'public'
  AND trigger_name LIKE '%admin%'
ORDER BY trigger_name;

-- ============================================
-- 7. CHECK EXISTING ADMINS
-- ============================================
SELECT 
  '7. EXISTING ADMINS' as section,
  '' as item,
  '' as status;

SELECT 
  'Admin Users' as section,
  COALESCE(email, 'No email') as item,
  'is_admin=' || COALESCE(is_admin::text, 'null') || ', role=' || COALESCE(role, 'null') as status
FROM profiles 
WHERE is_admin = true
ORDER BY created_at DESC;

-- ============================================
-- 8. SUMMARY
-- ============================================
SELECT 
  '8. SUMMARY' as section,
  '' as item,
  '' as status;

SELECT 
  'Summary' as section,
  'Total users' as item,
  COUNT(*)::text as status
FROM profiles;

SELECT 
  'Summary' as section,
  'Admin users' as item,
  COUNT(*)::text as status
FROM profiles 
WHERE is_admin = true;

SELECT 
  'Summary' as section,
  'User roles entries' as item,
  COUNT(*)::text as status
FROM user_roles;

SELECT 
  'Summary' as section,
  'Admin roles' as item,
  COUNT(*)::text as status
FROM user_roles 
WHERE role = 'admin';

-- ============================================
-- 9. RECOMMENDATIONS
-- ============================================
SELECT 
  '9. RECOMMENDATIONS' as section,
  '' as item,
  '' as status;

-- Check if is_admin column exists
SELECT 
  'Recommendations' as section,
  'profiles.is_admin column' as item,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'profiles' AND column_name = 'is_admin'
    ) THEN '✅ READY'
    ELSE '❌ RUN SETUP_ADMIN_TABLES.sql'
  END as status;

-- Check if user_roles table exists
SELECT 
  'Recommendations' as section,
  'user_roles table' as item,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.tables 
      WHERE table_name = 'user_roles'
    ) THEN '✅ READY'
    ELSE '❌ RUN SETUP_ADMIN_TABLES.sql'
  END as status;

-- Check if RLS policies exist
SELECT 
  'Recommendations' as section,
  'RLS policies' as item,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE tablename IN ('profiles', 'user_roles')
    ) THEN '✅ READY'
    ELSE '❌ RUN SETUP_ADMIN_TABLES.sql'
  END as status;

-- Check if any admins exist
SELECT 
  'Recommendations' as section,
  'Admin accounts' as item,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM profiles WHERE is_admin = true
    ) THEN '✅ ' || COUNT(*)::text || ' admin(s) exist'
    ELSE '⚠️ No admins yet - create one at /admin-login'
  END as status
FROM profiles 
WHERE is_admin = true;

-- ============================================
-- FINAL MESSAGE
-- ============================================
-- Check final status
SELECT 
  'FINAL STATUS' as section,
  CASE 
    WHEN NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'profiles' AND column_name = 'is_admin'
    ) THEN '❌ SETUP INCOMPLETE: Run database/SETUP_ADMIN_TABLES.sql'
    WHEN NOT EXISTS (
      SELECT 1 FROM profiles WHERE is_admin = true
    ) THEN '✅ SETUP COMPLETE: Ready to create admin account at /admin-login'
    ELSE '✅ FULLY CONFIGURED: ' || (SELECT COUNT(*)::text FROM profiles WHERE is_admin = true) || ' admin(s) exist'
  END as item,
  'Check results above for details' as status;
