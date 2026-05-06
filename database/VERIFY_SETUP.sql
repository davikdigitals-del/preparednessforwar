-- Verification Script
-- Run this to check if your database is ready for posts

-- 1. Check if sections table exists and has data
SELECT 
  '1. SECTIONS CHECK' as step,
  COUNT(*) as total_sections,
  COUNT(CASE WHEN is_active = true THEN 1 END) as active_sections
FROM sections;

-- 2. Show all sections
SELECT 
  '2. SECTION DETAILS' as step,
  slug,
  title,
  is_active,
  display_order
FROM sections
ORDER BY display_order;

-- 3. Check if posts table has correct structure
SELECT 
  '3. POSTS TABLE STRUCTURE' as step,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'posts'
  AND column_name IN ('standfirst', 'body', 'section', 'category', 'image', 'view_count')
ORDER BY column_name;

-- 4. Check current posts count
SELECT 
  '4. CURRENT POSTS' as step,
  COUNT(*) as total_posts,
  COUNT(CASE WHEN is_published = true THEN 1 END) as published_posts,
  COUNT(CASE WHEN status = 'draft' THEN 1 END) as draft_posts
FROM posts;

-- 5. Check if categories exist
SELECT 
  '5. CATEGORIES CHECK' as step,
  COUNT(*) as total_categories
FROM categories;

-- 6. Show sample categories
SELECT 
  '6. CATEGORY DETAILS' as step,
  name,
  slug,
  section_id
FROM categories
LIMIT 10;

-- Summary
SELECT 
  '✅ VERIFICATION COMPLETE' as status,
  'Check results above. If sections are missing, create them in Admin Panel first.' as note;
