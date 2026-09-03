-- Check what slug the health section actually uses

-- 1. What sections exist in the database?
SELECT slug, title, is_active
FROM sections
ORDER BY slug;

-- 2. What section slug do your health posts use?
SELECT DISTINCT section
FROM posts
WHERE section LIKE '%health%'
OR section LIKE '%wellness%'
ORDER BY section;

-- 3. Check all pinned posts and their sections
SELECT 
  section,
  COUNT(*) as pinned_count,
  STRING_AGG(title, ' | ' ORDER BY title) as post_titles
FROM posts
WHERE is_pinned = true
  AND status = 'published'
GROUP BY section
ORDER BY section;
