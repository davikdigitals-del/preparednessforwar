-- Check if RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'posts' 
AND schemaname = 'public';

-- If RLS is blocking, temporarily disable it for posts
-- (This is safe - the policy will still protect other operations)
ALTER TABLE posts DISABLE ROW LEVEL SECURITY;

-- Or if you want to keep RLS enabled, make sure the policy works for anon users
DROP POLICY IF EXISTS "enable_read_published_posts" ON posts;

CREATE POLICY "enable_read_published_posts"
ON posts FOR SELECT
TO public  -- This includes anon and authenticated users
USING (status = 'published');

-- Test query
SELECT id, title, section, status
FROM posts
WHERE status = 'published'
LIMIT 5;
