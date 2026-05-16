-- ============================================================================
-- CLEANUP DUPLICATE RLS POLICIES
-- ============================================================================
-- You have multiple duplicate policies on each table
-- This script removes all duplicates and keeps only one clean policy per table
-- ============================================================================

-- ============================================================================
-- POSTS TABLE - Remove all duplicates, keep one
-- ============================================================================

DROP POLICY IF EXISTS "Allow public read published posts" ON posts;
DROP POLICY IF EXISTS "Public can view published posts" ON posts;
DROP POLICY IF EXISTS "posts_public_select" ON posts;
DROP POLICY IF EXISTS "Posts are viewable by everyone" ON posts;
DROP POLICY IF EXISTS "Published posts are viewable by everyone" ON posts;
DROP POLICY IF EXISTS "posts_select" ON posts;

-- Create single clean policy for posts
CREATE POLICY "posts_select_policy"
  ON posts FOR SELECT
  USING (
    is_published = true 
    OR status = 'published'
    OR auth.uid() IN (SELECT id FROM profiles WHERE is_admin = true)
  );

-- ============================================================================
-- ALERTS TABLE - Remove all duplicates, keep one
-- ============================================================================

DROP POLICY IF EXISTS "Allow public read active alerts" ON alerts;
DROP POLICY IF EXISTS "alerts_public_select" ON alerts;
DROP POLICY IF EXISTS "alerts_select" ON alerts;
DROP POLICY IF EXISTS "Alerts are viewable by everyone" ON alerts;

-- Create single clean policy for alerts
CREATE POLICY "alerts_select_policy"
  ON alerts FOR SELECT
  USING (is_active = true);

-- ============================================================================
-- BANNER_SETTINGS TABLE - Remove all duplicates, keep one
-- ============================================================================

DROP POLICY IF EXISTS "Allow public read banner" ON banner_settings;
DROP POLICY IF EXISTS "banner_public_select" ON banner_settings;
DROP POLICY IF EXISTS "banner_select" ON banner_settings;
DROP POLICY IF EXISTS "Banner settings are viewable by everyone" ON banner_settings;

-- Create single clean policy for banner_settings
CREATE POLICY "banner_select_policy"
  ON banner_settings FOR SELECT
  USING (true);

-- ============================================================================
-- ENCYCLOPAEDIA_ENTRIES TABLE - Remove all duplicates, keep one
-- ============================================================================

DROP POLICY IF EXISTS "Allow public read encyclopaedia" ON encyclopaedia_entries;
DROP POLICY IF EXISTS "encyclopaedia_public_select" ON encyclopaedia_entries;
DROP POLICY IF EXISTS "encyclopaedia_select" ON encyclopaedia_entries;
DROP POLICY IF EXISTS "Encyclopaedia entries are viewable by everyone" ON encyclopaedia_entries;

-- Create single clean policy for encyclopaedia_entries
CREATE POLICY "encyclopaedia_select_policy"
  ON encyclopaedia_entries FOR SELECT
  USING (true);

-- ============================================================================
-- LIBRARY_ITEMS TABLE - Remove all duplicates, keep one
-- ============================================================================

DROP POLICY IF EXISTS "Allow public read library" ON library_items;
DROP POLICY IF EXISTS "library_items_public_select" ON library_items;
DROP POLICY IF EXISTS "library_select" ON library_items;
DROP POLICY IF EXISTS "Library items are viewable by everyone" ON library_items;

-- Create single clean policy for library_items
CREATE POLICY "library_select_policy"
  ON library_items FOR SELECT
  USING (true);

-- ============================================================================
-- MEDIA_ITEMS TABLE - Remove all duplicates, keep one
-- ============================================================================

DROP POLICY IF EXISTS "Allow public read media" ON media_items;
DROP POLICY IF EXISTS "Anyone can view media items" ON media_items;
DROP POLICY IF EXISTS "media_items_public_select" ON media_items;
DROP POLICY IF EXISTS "media_select" ON media_items;
DROP POLICY IF EXISTS "Media items are viewable by everyone" ON media_items;

-- Create single clean policy for media_items
CREATE POLICY "media_select_policy"
  ON media_items FOR SELECT
  USING (true);

-- ============================================================================
-- VERIFY CLEANUP - Should show only ONE SELECT policy per table
-- ============================================================================

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
-- EXPECTED RESULT:
-- ============================================================================
-- tablename             | policyname                  | cmd
-- --------------------- | --------------------------- | ------
-- alerts                | alerts_select_policy        | SELECT
-- banner_settings       | banner_select_policy        | SELECT
-- encyclopaedia_entries | encyclopaedia_select_policy | SELECT
-- library_items         | library_select_policy       | SELECT
-- media_items           | media_select_policy         | SELECT
-- posts                 | posts_select_policy         | SELECT
-- ============================================================================

-- ============================================================================
-- TEST PUBLIC ACCESS
-- ============================================================================

-- Test 1: Check if posts are visible
SELECT COUNT(*) as visible_posts 
FROM posts 
WHERE is_published = true OR status = 'published';

-- Test 2: Check if alerts are visible
SELECT COUNT(*) as visible_alerts 
FROM alerts 
WHERE is_active = true;

-- Test 3: Check if media items are visible
SELECT COUNT(*) as visible_media 
FROM media_items;

-- ============================================================================
-- DONE!
-- ============================================================================
-- Now test your website:
-- 1. Open in incognito mode (not logged in)
-- 2. Homepage should show posts
-- 3. All content should be visible
-- ============================================================================
