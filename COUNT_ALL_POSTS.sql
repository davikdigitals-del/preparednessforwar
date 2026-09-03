-- Count all posts by section and status
SELECT 
  section,
  status,
  COUNT(*) as count
FROM posts
GROUP BY section, status
ORDER BY section, status;

-- Show all published posts
SELECT id, title, section, category, status
FROM posts
WHERE status = 'published'
ORDER BY section, created_at DESC;
