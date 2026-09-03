-- Check what policies exist right now
SELECT 
  policyname,
  cmd,
  roles::text,
  qual::text as condition
FROM pg_policies
WHERE tablename = 'posts'
ORDER BY cmd, policyname;

-- Test if we can read posts
SELECT COUNT(*) as total_published_posts
FROM posts
WHERE status = 'published';

-- Show sample posts
SELECT id, title, section, category, status
FROM posts
LIMIT 10;
