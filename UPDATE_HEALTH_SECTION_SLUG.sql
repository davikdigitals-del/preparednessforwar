-- Migration: Update Health section slug from 'health' to 'health-wellness'
-- This fixes the routing conflict with the server health endpoint at /health

BEGIN;

-- 1. Update nav_sections table
UPDATE nav_sections 
SET slug = 'health-wellness'
WHERE slug = 'health';

-- 2. Update sections table (if exists)
UPDATE sections 
SET slug = 'health-wellness'
WHERE slug = 'health';

-- 3. Update posts that reference the health section
UPDATE posts 
SET section = 'health-wellness'
WHERE section = 'health';

-- 4. Update any categories that might be linked to the health section
-- (This updates based on the section reference in nav_categories)
-- Note: Categories themselves keep their slugs, just their section reference changes

-- 5. Update any quick_links or nav_tools that reference the health section
-- (No direct updates needed as they reference by section_id which remains the same)

-- Verify the changes
SELECT 'Updated nav_sections:' as status;
SELECT id, title, slug FROM nav_sections WHERE slug LIKE '%health%';

SELECT 'Updated sections:' as status;
SELECT id, name, slug FROM sections WHERE slug LIKE '%health%';

SELECT 'Updated posts count:' as status;
SELECT COUNT(*) as health_wellness_posts FROM posts WHERE section = 'health-wellness';

SELECT 'Remaining old health references:' as status;  
SELECT COUNT(*) as old_health_posts FROM posts WHERE section = 'health';

COMMIT;

-- If you need to rollback, run:
-- BEGIN;
-- UPDATE nav_sections SET slug = 'health' WHERE slug = 'health-wellness';
-- UPDATE sections SET slug = 'health' WHERE slug = 'health-wellness';  
-- UPDATE posts SET section = 'health' WHERE section = 'health-wellness';
-- COMMIT;