-- ============================================================================
-- DIAGNOSE WHY POSTS DON'T LOAD
-- ============================================================================

-- Step 1: Check if posts table exists and has data
SELECT 
  COUNT(*) as total_posts,
  COUNT(*) FILTER (WHERE is_published = true) as published_count,
  COUNT(*) FILTER (WHERE status = 'published') as status_published_count
FROM posts;

-- Step 2: Check the actual column names and values
SELECT 
  id,
  title,
  is_published,
  status,
  created_at
FROM posts
LIMIT 5;

-- Step 3: Check if is_published column exists
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'posts'
  AND column_name IN ('is_published', 'status');

-- Step 4: Check RLS is enabled
SELECT 
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename = 'posts';

-- Step 5: Check current policies
SELECT 
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'posts'
ORDER BY policyname;

-- Step 6: Test if you can see posts (run this while logged out)
-- This simulates what anonymous users see
SET ROLE anon;
SELECT COUNT(*) as visible_to_anon FROM posts;
RESET ROLE;

-- ============================================================================
-- BASED ON RESULTS, RUN ONE OF THESE FIXES:
-- ============================================================================

-- FIX 1: If is_published column doesn't exist
-- ALTER TABLE posts ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT false;

-- FIX 2: If posts exist but is_published = false
-- UPDATE posts SET is_published = true, status = 'published';

-- FIX 3: If RLS is blocking (visible_to_anon = 0)
-- DROP POLICY IF EXISTS "posts_select_policy" ON posts;
-- CREATE POLICY "posts_select_policy" ON posts FOR SELECT TO anon, authenticated USING (true);

-- FIX 4: Temporarily disable RLS to test (NOT RECOMMENDED FOR PRODUCTION)
-- ALTER TABLE posts DISABLE ROW LEVEL SECURITY;
