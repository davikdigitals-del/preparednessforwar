-- ============================================================================
-- COMPLETE PIN DIAGNOSTIC
-- ============================================================================

-- 1. Show ALL pinned posts (regardless of status)
SELECT 
  '=== ALL PINNED POSTS ===' as info,
  id,
  title,
  section,
  status,
  is_pinned,
  created_at
FROM posts
WHERE is_pinned = true
ORDER BY section, created_at DESC;

-- 2. Show PUBLISHED + PINNED posts (what the menu should use)
SELECT 
  '=== PUBLISHED & PINNED POSTS (MENU DATA) ===' as info,
  id,
  title,
  section,
  category,
  status,
  is_pinned
FROM posts
WHERE is_pinned = true AND status = 'published'
ORDER BY section, created_at DESC;

-- 3. Count by section
SELECT 
  '=== COUNT BY SECTION ===' as info,
  section,
  COUNT(*) as pinned_published_count
FROM posts
WHERE is_pinned = true AND status = 'published'
GROUP BY section
ORDER BY section;

-- 4. Check if is_pinned column exists
SELECT 
  '=== COLUMN CHECK ===' as info,
  column_name,
  data_type,
  column_default
FROM information_schema.columns
WHERE table_name = 'posts'
AND column_name = 'is_pinned';

-- 5. Check RLS policies
SELECT 
  '=== RLS POLICIES ===' as info,
  policyname,
  cmd,
  roles::text
FROM pg_policies
WHERE tablename = 'posts'
AND cmd = 'SELECT'
ORDER BY policyname;
