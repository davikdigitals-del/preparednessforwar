-- ========================================
-- FIX PINNED POSTS FOR MEGA MENU FEATURED
-- ========================================

-- 1. Ensure is_pinned column exists
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'posts' AND column_name = 'is_pinned'
    ) THEN
        ALTER TABLE posts ADD COLUMN is_pinned BOOLEAN DEFAULT FALSE;
    END IF;
END $$;

-- 2. Create index on is_pinned if it doesn't exist
CREATE INDEX IF NOT EXISTS idx_posts_is_pinned ON posts(is_pinned);
CREATE INDEX IF NOT EXISTS idx_posts_section_pinned ON posts(section, is_pinned);

-- 3. Reset all posts to unpinned first
UPDATE posts SET is_pinned = FALSE;

-- 4. Pin 2 posts per section for testing (using latest published posts)
-- Emergency section
WITH emergency_posts AS (
  SELECT id FROM posts 
  WHERE section = 'emergency' AND status = 'published'
  ORDER BY published_at DESC 
  LIMIT 2
)
UPDATE posts SET is_pinned = TRUE 
WHERE id IN (SELECT id FROM emergency_posts);

-- Survival section  
WITH survival_posts AS (
  SELECT id FROM posts 
  WHERE section = 'survival' AND status = 'published'
  ORDER BY published_at DESC 
  LIMIT 2
)
UPDATE posts SET is_pinned = TRUE 
WHERE id IN (SELECT id FROM survival_posts);

-- Health section
WITH health_posts AS (
  SELECT id FROM posts 
  WHERE section = 'health' AND status = 'published'
  ORDER BY published_at DESC 
  LIMIT 2
)
UPDATE posts SET is_pinned = TRUE 
WHERE id IN (SELECT id FROM health_posts);

-- Government section
WITH government_posts AS (
  SELECT id FROM posts 
  WHERE section = 'government' AND status = 'published'
  ORDER BY published_at DESC 
  LIMIT 2
)
UPDATE posts SET is_pinned = TRUE 
WHERE id IN (SELECT id FROM government_posts);

-- Resources section
WITH resources_posts AS (
  SELECT id FROM posts 
  WHERE section = 'resources' AND status = 'published'
  ORDER BY published_at DESC 
  LIMIT 2
)
UPDATE posts SET is_pinned = TRUE 
WHERE id IN (SELECT id FROM resources_posts);

-- 5. Verify pinned posts count per section
SELECT 
  section,
  COUNT(*) as pinned_count,
  array_agg(title ORDER BY published_at DESC) as pinned_titles
FROM posts 
WHERE is_pinned = TRUE AND status = 'published'
GROUP BY section
ORDER BY section;

-- 6. Show all pinned posts with details
SELECT 
  id,
  title,
  section,
  category,
  is_pinned,
  status,
  published_at
FROM posts 
WHERE is_pinned = TRUE
ORDER BY section, published_at DESC;
