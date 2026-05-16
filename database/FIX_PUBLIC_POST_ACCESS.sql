-- ============================================================================
-- FIX PUBLIC ACCESS TO POSTS
-- ============================================================================
-- This fixes the issue where posts don't load unless admin is logged in
-- Run this in Supabase SQL Editor
-- ============================================================================

-- Step 1: Check current RLS status
SELECT 
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename = 'posts';

-- Step 2: Drop all existing policies on posts table
DROP POLICY IF EXISTS "Posts are viewable by everyone" ON posts;
DROP POLICY IF EXISTS "Published posts are viewable by everyone" ON posts;
DROP POLICY IF EXISTS "posts_select" ON posts;
DROP POLICY IF EXISTS "Admins can insert posts" ON posts;
DROP POLICY IF EXISTS "Admins can update posts" ON posts;
DROP POLICY IF EXISTS "Admins can delete posts" ON posts;
DROP POLICY IF EXISTS "posts_admin_delete" ON posts;

-- Step 3: Create new policies that allow public read access

-- Allow EVERYONE (including anonymous users) to view published posts
CREATE POLICY "posts_public_select"
  ON posts FOR SELECT
  USING (
    is_published = true 
    OR status = 'published'
    OR auth.uid() IN (SELECT id FROM profiles WHERE is_admin = true)
  );

-- Allow authenticated admins to insert posts
CREATE POLICY "posts_admin_insert"
  ON posts FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() IN (SELECT id FROM profiles WHERE is_admin = true)
  );

-- Allow authenticated admins to update posts
CREATE POLICY "posts_admin_update"
  ON posts FOR UPDATE
  TO authenticated
  USING (
    auth.uid() IN (SELECT id FROM profiles WHERE is_admin = true)
  );

-- Allow authenticated admins to delete posts
CREATE POLICY "posts_admin_delete"
  ON posts FOR DELETE
  TO authenticated
  USING (
    auth.uid() IN (SELECT id FROM profiles WHERE is_admin = true)
  );

-- Step 4: Ensure RLS is enabled on posts table
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- Step 5: Verify policies are created
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'posts'
ORDER BY policyname;

-- ============================================================================
-- EXPECTED RESULT:
-- ============================================================================
-- You should see 4 policies:
-- 1. posts_public_select - SELECT - Anyone can read published posts
-- 2. posts_admin_insert - INSERT - Admins can create posts
-- 3. posts_admin_update - UPDATE - Admins can edit posts
-- 4. posts_admin_delete - DELETE - Admins can delete posts
-- ============================================================================

-- Step 6: Test public access (should return published posts)
SELECT COUNT(*) as published_posts_count
FROM posts
WHERE is_published = true OR status = 'published';

-- If this returns 0, you need to add posts or publish existing ones:
-- UPDATE posts SET is_published = true, status = 'published' WHERE id IN (SELECT id FROM posts LIMIT 5);

-- ============================================================================
-- TROUBLESHOOTING
-- ============================================================================

-- If posts still don't show, check if is_published column exists:
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'posts' 
  AND column_name IN ('is_published', 'status');

-- If is_published doesn't exist, add it:
-- ALTER TABLE posts ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT false;

-- Then publish some posts:
-- UPDATE posts SET is_published = true, status = 'published';

-- ============================================================================
-- APPLY TO OTHER TABLES (if needed)
-- ============================================================================

-- Alerts - public read access
DROP POLICY IF EXISTS "Alerts are viewable by everyone" ON alerts;
CREATE POLICY "alerts_public_select"
  ON alerts FOR SELECT
  USING (is_active = true);

-- Media items - public read access
DROP POLICY IF EXISTS "Media items are viewable by everyone" ON media_items;
CREATE POLICY "media_items_public_select"
  ON media_items FOR SELECT
  USING (true);

-- Library items - public read access
DROP POLICY IF EXISTS "Library items are viewable by everyone" ON library_items;
CREATE POLICY "library_items_public_select"
  ON library_items FOR SELECT
  USING (true);

-- Encyclopaedia entries - public read access
DROP POLICY IF EXISTS "Encyclopaedia entries are viewable by everyone" ON encyclopaedia_entries;
CREATE POLICY "encyclopaedia_public_select"
  ON encyclopaedia_entries FOR SELECT
  USING (true);

-- Banner settings - public read access
DROP POLICY IF EXISTS "Banner settings are viewable by everyone" ON banner_settings;
CREATE POLICY "banner_public_select"
  ON banner_settings FOR SELECT
  USING (true);

-- ============================================================================
-- VERIFY ALL PUBLIC ACCESS
-- ============================================================================

-- Check all tables have public read policies
SELECT 
  tablename,
  policyname,
  cmd
FROM pg_policies 
WHERE schemaname = 'public'
  AND cmd = 'SELECT'
  AND tablename IN ('posts', 'alerts', 'media_items', 'library_items', 'encyclopaedia_entries', 'banner_settings')
ORDER BY tablename, policyname;

-- ============================================================================
-- DONE!
-- ============================================================================
-- Now test your website:
-- 1. Open your site in incognito/private mode (not logged in)
-- 2. Homepage should show posts
-- 3. Section pages should show posts
-- 4. Article pages should load
-- ============================================================================
