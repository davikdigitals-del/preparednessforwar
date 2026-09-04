-- Migration: Update Health section slug from 'health' to 'health-wellness'
-- This fixes the routing conflict with the server health endpoint at /health

BEGIN;

-- 1. Update nav_sections table (this should always exist)
UPDATE nav_sections 
SET slug = 'health-wellness'
WHERE slug = 'health';

-- 2. Update sections table only if it exists and has the right structure
DO $$
BEGIN
    -- Check if sections table exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'sections') THEN
        -- Check if it has a slug column
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sections' AND column_name = 'slug') THEN
            UPDATE sections SET slug = 'health-wellness' WHERE slug = 'health';
            RAISE NOTICE 'Updated sections table';
        ELSE
            RAISE NOTICE 'sections table exists but has no slug column';
        END IF;
    ELSE
        RAISE NOTICE 'sections table does not exist';
    END IF;
END $$;

-- 3. Update posts that reference the health section
UPDATE posts 
SET section = 'health-wellness'
WHERE section = 'health';

-- 4. Update any categories table if it exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'categories') THEN
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'categories' AND column_name = 'section') THEN
            UPDATE categories SET section = 'health-wellness' WHERE section = 'health';
            RAISE NOTICE 'Updated categories table';
        END IF;
    END IF;
END $$;

-- Verify the changes
SELECT 'Updated nav_sections:' as status;
SELECT id, title, slug FROM nav_sections WHERE slug LIKE '%health%';

SELECT 'Updated posts count:' as status;
SELECT COUNT(*) as health_wellness_posts FROM posts WHERE section = 'health-wellness';

SELECT 'Remaining old health references:' as status;  
SELECT COUNT(*) as old_health_posts FROM posts WHERE section = 'health';

-- Show all posts that now use the new section name
SELECT 'Posts now using health-wellness:' as status;
SELECT id, title, section FROM posts WHERE section = 'health-wellness' LIMIT 5;

COMMIT;

-- If you need to rollback, run:
-- BEGIN;
-- UPDATE nav_sections SET slug = 'health' WHERE slug = 'health-wellness';
-- UPDATE posts SET section = 'health' WHERE section = 'health-wellness';
-- COMMIT;