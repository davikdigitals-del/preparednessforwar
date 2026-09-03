-- Check health section configuration and pinned posts

-- 1. What sections exist in the database?
SELECT slug, title, is_active
FROM sections
WHERE is_active = true
ORDER BY slug;

-- 2. What are your pinned health posts called (section name)?
SELECT id, title, section, status, is_pinned
FROM posts
WHERE is_pinned = true 
  AND status = 'published'
  AND (section ILIKE '%health%' OR section ILIKE '%wellness%')
ORDER BY section;

-- 3. ALL pinned posts with their exact section names
SELECT DISTINCT section, COUNT(*) as pinned_count
FROM posts
WHERE is_pinned = true 
  AND status = 'published'
GROUP BY section
ORDER BY section;

-- 4. Check if "health" section posts exist at all
SELECT COUNT(*) as total_health_posts,
       SUM(CASE WHEN is_pinned THEN 1 ELSE 0 END) as pinned_health_posts
FROM posts
WHERE section = 'health'
  AND status = 'published';
