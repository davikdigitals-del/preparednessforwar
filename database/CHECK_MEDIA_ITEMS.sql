-- Check Media Items Table Status
-- Run this to see if media_items table exists and what's in it

-- 1. Check if table exists
SELECT 
  'Table Status' as check_type,
  'media_items' as table_name,
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'media_items')
    THEN '✅ EXISTS'
    ELSE '❌ DOES NOT EXIST - Run CREATE_MEDIA_ITEMS_TABLE.sql'
  END as status;

-- 2. Check table structure (if exists)
SELECT 
  'Column Structure' as info,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'media_items'
ORDER BY ordinal_position;

-- 3. Check indexes
SELECT 
  'Indexes' as info,
  indexname as index_name,
  indexdef as definition
FROM pg_indexes 
WHERE tablename = 'media_items'
ORDER BY indexname;

-- 4. Check RLS policies
SELECT 
  'RLS Policies' as info,
  policyname as policy_name,
  cmd as command,
  permissive,
  roles
FROM pg_policies 
WHERE tablename = 'media_items'
ORDER BY policyname;

-- 5. Check RLS status
SELECT 
  'RLS Status' as info,
  tablename,
  CASE 
    WHEN rowsecurity THEN '✅ ENABLED'
    ELSE '❌ DISABLED'
  END as rls_status
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename = 'media_items';

-- 6. Count media items by type
SELECT 
  'Media Count' as info,
  type,
  COUNT(*) as count
FROM media_items
GROUP BY type
ORDER BY type;

-- 7. Show all media items
SELECT 
  'All Media Items' as info,
  id,
  title,
  type,
  author,
  duration,
  views,
  is_premium,
  published_at
FROM media_items
ORDER BY published_at DESC;

-- 8. Check for videos only
SELECT 
  'Videos Only' as info,
  COUNT(*) as total_videos
FROM media_items
WHERE type = 'video';

-- 9. Check for podcasts only
SELECT 
  'Podcasts Only' as info,
  COUNT(*) as total_podcasts
FROM media_items
WHERE type = 'podcast';

-- 10. Summary
SELECT 
  'Summary' as section,
  'Total media items' as metric,
  COUNT(*)::text as value
FROM media_items
UNION ALL
SELECT 
  'Summary',
  'Videos',
  COUNT(*)::text
FROM media_items WHERE type = 'video'
UNION ALL
SELECT 
  'Summary',
  'Podcasts',
  COUNT(*)::text
FROM media_items WHERE type = 'podcast'
UNION ALL
SELECT 
  'Summary',
  'Premium items',
  COUNT(*)::text
FROM media_items WHERE is_premium = true
UNION ALL
SELECT 
  'Summary',
  'Total views',
  SUM(views)::text
FROM media_items;
