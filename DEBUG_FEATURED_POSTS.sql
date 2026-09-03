-- Debug script to check why pinned posts aren't showing in menu

-- 1. Check if there are any pinned posts
SELECT 
  id,
  title,
  section,
  category,
  status,
  is_pinned,
  published_at
FROM posts
WHERE is_pinned = true
ORDER BY section, published_at DESC;

-- 2. Check if there are published + pinned posts (what the hook fetches)
SELECT 
  id,
  title,
  section,
  category,
  status,
  is_pinned,
  published_at
FROM posts
WHERE is_pinned = true 
  AND status = 'published'
ORDER BY section, published_at DESC;

-- 3. Check RLS policies on posts table
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'posts';

-- 4. Check if anon/authenticated roles can SELECT posts
-- Run this as authenticated user in browser console:
-- const { data, error } = await supabase
--   .from("posts")
--   .select("id, title, section, is_pinned")
--   .eq("is_pinned", true)
--   .eq("status", "published");
-- console.log("Featured posts:", data, error);
