-- ============================================================================
-- RESTORE POST ACCESS - Fix posts not showing on section pages
-- ============================================================================

-- Remove all SELECT policies
DROP POLICY IF EXISTS "anon_read_published_posts" ON posts;
DROP POLICY IF EXISTS "auth_read_posts" ON posts;
DROP POLICY IF EXISTS "posts_anon_select_published" ON posts;
DROP POLICY IF EXISTS "posts_auth_select" ON posts;
DROP POLICY IF EXISTS "public_read_published" ON posts;
DROP POLICY IF EXISTS "Anyone can view published posts" ON posts;
DROP POLICY IF EXISTS "Public posts are viewable by everyone" ON posts;

-- Create ONE simple policy that allows everyone to read published posts
CREATE POLICY "enable_read_published_posts"
ON posts FOR SELECT
USING (status = 'published');

-- Verify it works
SELECT id, title, section, category, status
FROM posts
WHERE status = 'published'
LIMIT 5;

-- Show what policies exist now
SELECT policyname, cmd, roles::text
FROM pg_policies
WHERE tablename = 'posts'
ORDER BY cmd, policyname;
