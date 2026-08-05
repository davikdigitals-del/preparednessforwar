-- ============================================
-- CHECK DATABASE SCHEMA - Verify everything matches the website
-- ============================================
-- Run this in Supabase SQL Editor to check your database structure

-- ============================================
-- CHECK 1: List all tables in public schema
-- ============================================
SELECT 
  '=== ALL TABLES IN DATABASE ===' AS check_section;

SELECT 
  table_name,
  table_type
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;

-- ============================================
-- CHECK 2: Navigation Tables (for website menu)
-- ============================================
SELECT 
  '=== NAVIGATION TABLES CHECK ===' AS check_section;

-- Check if nav_sections table exists
SELECT 
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = 'nav_sections'
    ) THEN '✅ nav_sections table EXISTS'
    ELSE '❌ nav_sections table MISSING'
  END AS nav_sections_status;

-- Check if nav_categories table exists
SELECT 
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = 'nav_categories'
    ) THEN '✅ nav_categories table EXISTS'
    ELSE '❌ nav_categories table MISSING'
  END AS nav_categories_status;

-- Check if nav_tools table exists
SELECT 
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = 'nav_tools'
    ) THEN '✅ nav_tools table EXISTS'
    ELSE '❌ nav_tools table MISSING'
  END AS nav_tools_status;

-- ============================================
-- CHECK 3: Content Tables (for posts/articles)
-- ============================================
SELECT 
  '=== CONTENT TABLES CHECK ===' AS check_section;

-- Check posts table
SELECT 
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = 'posts'
    ) THEN '✅ posts table EXISTS'
    ELSE '❌ posts table MISSING'
  END AS posts_status;

-- Check sections table
SELECT 
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = 'sections'
    ) THEN '✅ sections table EXISTS'
    ELSE '❌ sections table MISSING'
  END AS sections_status;

-- Check categories table
SELECT 
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = 'categories'
    ) THEN '✅ categories table EXISTS'
    ELSE '❌ categories table MISSING'
  END AS categories_status;

-- ============================================
-- CHECK 4: Navigation Data (what's actually in the tables)
-- ============================================
SELECT 
  '=== NAVIGATION SECTIONS DATA ===' AS check_section;

-- Show all navigation sections (if table exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'nav_sections') THEN
    RAISE NOTICE 'Checking nav_sections data...';
  END IF;
END $$;

SELECT 
  id,
  title,
  slug,
  color,
  sort_order,
  is_active
FROM nav_sections
ORDER BY sort_order
LIMIT 100;

-- ============================================
-- CHECK 5: Navigation Categories Data
-- ============================================
SELECT 
  '=== NAVIGATION CATEGORIES DATA ===' AS check_section;

SELECT 
  nc.id,
  nc.title,
  nc.slug,
  ns.title as section_name,
  nc.sort_order
FROM nav_categories nc
LEFT JOIN nav_sections ns ON nc.section_id = ns.id
ORDER BY ns.sort_order, nc.sort_order
LIMIT 100;

-- ============================================
-- CHECK 6: Posts Count
-- ============================================
SELECT 
  '=== POSTS COUNT ===' AS check_section;

SELECT 
  COUNT(*) as total_posts,
  COUNT(CASE WHEN status = 'published' THEN 1 END) as published_posts,
  COUNT(CASE WHEN status = 'draft' THEN 1 END) as draft_posts
FROM posts;

-- ============================================
-- CHECK 7: Posts by Section
-- ============================================
SELECT 
  '=== POSTS BY SECTION ===' AS check_section;

SELECT 
  section,
  COUNT(*) as post_count
FROM posts
GROUP BY section
ORDER BY post_count DESC;

-- ============================================
-- CHECK 8: Required Columns in Posts Table
-- ============================================
SELECT 
  '=== POSTS TABLE COLUMNS ===' AS check_section;

SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'posts'
ORDER BY ordinal_position;

-- ============================================
-- CHECK 9: Library Items
-- ============================================
SELECT 
  '=== LIBRARY ITEMS CHECK ===' AS check_section;

SELECT 
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = 'library_items'
    ) THEN '✅ library_items table EXISTS'
    ELSE '❌ library_items table MISSING'
  END AS library_status;

SELECT COUNT(*) as total_library_items FROM library_items;

-- ============================================
-- CHECK 10: Media Items
-- ============================================
SELECT 
  '=== MEDIA ITEMS CHECK ===' AS check_section;

SELECT 
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = 'media_items'
    ) THEN '✅ media_items table EXISTS'
    ELSE '❌ media_items table MISSING'
  END AS media_status;

SELECT COUNT(*) as total_media_items FROM media_items;

-- ============================================
-- CHECK 11: User Profiles
-- ============================================
SELECT 
  '=== PROFILES CHECK ===' AS check_section;

SELECT 
  COUNT(*) as total_users,
  COUNT(CASE WHEN role = 'admin' THEN 1 END) as admin_users,
  COUNT(CASE WHEN role = 'member' THEN 1 END) as member_users
FROM profiles;

-- ============================================
-- SUMMARY
-- ============================================
SELECT 
  '=== DATABASE HEALTH SUMMARY ===' AS check_section;

DO $$
DECLARE
  nav_sections_exists boolean;
  nav_categories_exists boolean;
  posts_count integer;
  published_count integer;
BEGIN
  -- Check navigation tables
  SELECT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_name = 'nav_sections'
  ) INTO nav_sections_exists;
  
  SELECT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_name = 'nav_categories'
  ) INTO nav_categories_exists;
  
  -- Check posts
  SELECT COUNT(*) INTO posts_count FROM posts;
  SELECT COUNT(*) INTO published_count FROM posts WHERE status = 'published';
  
  -- Report
  RAISE NOTICE '';
  RAISE NOTICE '==============================================';
  RAISE NOTICE 'DATABASE HEALTH CHECK COMPLETE';
  RAISE NOTICE '==============================================';
  RAISE NOTICE '';
  
  IF nav_sections_exists AND nav_categories_exists THEN
    RAISE NOTICE '✅ Navigation tables: OK';
  ELSE
    RAISE NOTICE '❌ Navigation tables: MISSING - Need to create nav_sections and nav_categories';
  END IF;
  
  RAISE NOTICE 'Total posts: %', posts_count;
  RAISE NOTICE 'Published posts: %', published_count;
  
  IF posts_count = 0 THEN
    RAISE NOTICE '⚠️  WARNING: No posts in database - website will look empty';
  END IF;
  
  RAISE NOTICE '';
  RAISE NOTICE 'Next steps:';
  RAISE NOTICE '1. If navigation tables are missing, create them';
  RAISE NOTICE '2. Add sample posts to populate the website';
  RAISE NOTICE '3. Use Admin → Sections to manage navigation menu';
  RAISE NOTICE '';
END $$;
