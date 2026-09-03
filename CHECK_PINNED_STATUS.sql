-- Check which pinned posts are published (what will show in menu)
SELECT 
  id,
  title,
  section,
  status,
  is_pinned,
  CASE 
    WHEN status = 'published' AND is_pinned = true THEN '✅ WILL SHOW IN MENU'
    WHEN status = 'draft' AND is_pinned = true THEN '❌ DRAFT - WON''T SHOW'
    ELSE 'Not pinned'
  END as menu_status
FROM posts
WHERE is_pinned = true
ORDER BY section, status DESC;
