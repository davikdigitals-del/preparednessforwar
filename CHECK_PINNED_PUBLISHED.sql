-- Check which posts are BOTH published AND pinned (what the menu uses)
SELECT 
  id,
  title,
  section,
  status,
  is_pinned,
  published_at
FROM posts
WHERE is_pinned = true
ORDER BY section, published_at DESC;

-- Check if there are ANY published + pinned posts
SELECT 
  section,
  COUNT(*) as pinned_published_count
FROM posts
WHERE is_pinned = true AND status = 'published'
GROUP BY section;
