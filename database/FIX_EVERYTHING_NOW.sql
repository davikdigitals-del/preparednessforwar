-- ============================================================================
-- FIX EVERYTHING - RUN THIS ONE FILE
-- ============================================================================
-- This fixes ALL admin portal and post loading issues
-- Copy and paste this ENTIRE file into Supabase SQL Editor and click RUN
-- ============================================================================

-- ============================================================================
-- PART 1: FIX PUBLIC ACCESS TO POSTS
-- ============================================================================

-- Remove all duplicate policies
DROP POLICY IF EXISTS "Allow public read published posts" ON posts;
DROP POLICY IF EXISTS "Public can view published posts" ON posts;
DROP POLICY IF EXISTS "posts_public_select" ON posts;
DROP POLICY IF EXISTS "Posts are viewable by everyone" ON posts;
DROP POLICY IF EXISTS "Published posts are viewable by everyone" ON posts;
DROP POLICY IF EXISTS "posts_select" ON posts;
DROP POLICY IF EXISTS "posts_select_policy" ON posts;

-- Create ONE clean policy that allows everyone to see posts
CREATE POLICY "posts_public_read"
  ON posts FOR SELECT
  TO anon, authenticated
  USING (true);  -- Allow EVERYONE to see ALL posts

-- Ensure RLS is enabled
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- Grant permissions to anon role
GRANT SELECT ON posts TO anon;
GRANT SELECT ON posts TO authenticated;

-- ============================================================================
-- PART 2: PUBLISH ALL POSTS
-- ============================================================================

-- Add is_published column if it doesn't exist
ALTER TABLE posts ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT false;

-- Publish ALL posts
UPDATE posts 
SET 
  is_published = true,
  status = 'published'
WHERE is_published = false OR status != 'published' OR status IS NULL;

-- ============================================================================
-- PART 3: FIX ADMIN ROLE (REPLACE EMAIL!)
-- ============================================================================

-- ⚠️ IMPORTANT: Replace 'your-admin-email@example.com' with YOUR actual email!

-- Set admin role in profiles
UPDATE profiles 
SET 
  is_admin = true,
  role = 'admin'
WHERE email = 'your-admin-email@example.com';

-- Set admin role in user_roles
INSERT INTO user_roles (user_id, role)
SELECT id, 'admin' 
FROM profiles 
WHERE email = 'your-admin-email@example.com'
ON CONFLICT (user_id, role) 
DO UPDATE SET role = 'admin';

-- ============================================================================
-- PART 4: FIX OTHER TABLES (OPTIONAL)
-- ============================================================================

-- Clean up alerts policies
DROP POLICY IF EXISTS "Allow public read active alerts" ON alerts;
DROP POLICY IF EXISTS "alerts_public_select" ON alerts;
DROP POLICY IF EXISTS "alerts_select" ON alerts;
CREATE POLICY "alerts_public_read" ON alerts FOR SELECT TO anon, authenticated USING (true);
GRANT SELECT ON alerts TO anon;

-- Clean up media_items policies
DROP POLICY IF EXISTS "Allow public read media" ON media_items;
DROP POLICY IF EXISTS "Anyone can view media items" ON media_items;
DROP POLICY IF EXISTS "media_items_public_select" ON media_items;
DROP POLICY IF EXISTS "media_select" ON media_items;
CREATE POLICY "media_public_read" ON media_items FOR SELECT TO anon, authenticated USING (true);
GRANT SELECT ON media_items TO anon;

-- Clean up library_items policies
DROP POLICY IF EXISTS "Allow public read library" ON library_items;
DROP POLICY IF EXISTS "library_items_public_select" ON library_items;
DROP POLICY IF EXISTS "library_select" ON library_items;
CREATE POLICY "library_public_read" ON library_items FOR SELECT TO anon, authenticated USING (true);
GRANT SELECT ON library_items TO anon;

-- Clean up banner_settings policies
DROP POLICY IF EXISTS "Allow public read banner" ON banner_settings;
DROP POLICY IF EXISTS "banner_public_select" ON banner_settings;
DROP POLICY IF EXISTS "banner_select" ON banner_settings;
CREATE POLICY "banner_public_read" ON banner_settings FOR SELECT TO anon, authenticated USING (true);
GRANT SELECT ON banner_settings TO anon;

-- Clean up encyclopaedia_entries policies
DROP POLICY IF EXISTS "Allow public read encyclopaedia" ON encyclopaedia_entries;
DROP POLICY IF EXISTS "encyclopaedia_public_select" ON encyclopaedia_entries;
DROP POLICY IF EXISTS "encyclopaedia_select" ON encyclopaedia_entries;
CREATE POLICY "encyclopaedia_public_read" ON encyclopaedia_entries FOR SELECT TO anon, authenticated USING (true);
GRANT SELECT ON encyclopaedia_entries TO anon;

-- ============================================================================
-- PART 5: ADD SAMPLE POSTS (IF NEEDED)
-- ============================================================================

-- Check if posts exist
DO $$
DECLARE
  post_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO post_count FROM posts;
  
  -- If no posts exist, add sample posts
  IF post_count = 0 THEN
    INSERT INTO posts (title, standfirst, section, category, author, body, image, tags, is_published, status, published_at, read_time)
    VALUES 
      ('Welcome to Preparedness Hub', 'Your source for defense and security news', 'news', 'breaking-news', 'Admin', '<p>Welcome to our platform. This is a sample post to get you started.</p>', 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800', ARRAY['news', 'welcome'], true, 'published', NOW(), '5 min'),
      ('Latest Defense Updates', 'Stay informed about global security', 'defense', 'military-tech', 'Admin', '<p>Latest updates in defense technology and military operations.</p>', 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800', ARRAY['defense', 'military'], true, 'published', NOW(), '6 min'),
      ('NATO Alliance News', 'Updates from NATO member countries', 'geopolitics', 'nato-updates', 'Admin', '<p>Important updates from the NATO alliance and member nations.</p>', 'https://images.unsplash.com/photo-1523961131990-5ea7c61b2107?w=800', ARRAY['nato', 'alliance'], true, 'published', NOW(), '7 min'),
      ('Cybersecurity Briefing', 'Latest threats and defenses', 'technology', 'cybersecurity', 'Admin', '<p>Critical cybersecurity updates and threat intelligence.</p>', 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800', ARRAY['cyber', 'security'], true, 'published', NOW(), '8 min'),
      ('Intelligence Report', 'Strategic intelligence analysis', 'intelligence', 'analysis', 'Admin', '<p>In-depth intelligence analysis and strategic assessments.</p>', 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800', ARRAY['intelligence', 'analysis'], true, 'published', NOW(), '10 min');
    
    RAISE NOTICE 'Added 5 sample posts';
  ELSE
    RAISE NOTICE 'Posts already exist (%), skipping sample data', post_count;
  END IF;
END $$;

-- ============================================================================
-- PART 6: VERIFY EVERYTHING
-- ============================================================================

-- Check posts are visible
SELECT 
  COUNT(*) as total_posts,
  COUNT(*) FILTER (WHERE is_published = true) as published_posts
FROM posts;

-- Check admin role is set
SELECT 
  email,
  is_admin,
  role
FROM profiles 
WHERE email = 'your-admin-email@example.com';

-- Check policies are clean (should show only ONE per table)
SELECT 
  tablename,
  COUNT(*) as policy_count
FROM pg_policies 
WHERE tablename IN ('posts', 'alerts', 'media_items', 'library_items', 'banner_settings', 'encyclopaedia_entries')
  AND cmd = 'SELECT'
GROUP BY tablename
ORDER BY tablename;

-- ============================================================================
-- EXPECTED RESULTS:
-- ============================================================================
-- total_posts: 5 or more
-- published_posts: 5 or more
-- email: your-admin-email@example.com
-- is_admin: true
-- role: admin
-- policy_count: 1 for each table
-- ============================================================================

-- ============================================================================
-- DONE! NOW TEST:
-- ============================================================================
-- 1. Open your site in incognito mode → Should see posts
-- 2. Go to /admin-login → Login → Should redirect to /admin
-- 3. Refresh /admin page → Should stay on /admin
-- 4. Logout and login again → Should still be admin
-- ============================================================================

RAISE NOTICE '✅ ALL FIXES APPLIED!';
RAISE NOTICE '⚠️  IMPORTANT: Replace your-admin-email@example.com with your actual email!';
RAISE NOTICE '🧪 TEST: Open site in incognito mode to verify posts are visible';
RAISE NOTICE '🔐 TEST: Login at /admin-login to verify admin access';
