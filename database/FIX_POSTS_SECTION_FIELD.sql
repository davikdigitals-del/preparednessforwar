-- ============================================
-- FIX POSTS SECTION FIELD
-- ============================================
-- The posts table currently uses section_id (UUID) but the frontend
-- expects a section field with the slug (string)
-- This script adds the section field and syncs it with section_id

-- Step 1: Add section column if it doesn't exist
ALTER TABLE posts ADD COLUMN IF NOT EXISTS section TEXT;

-- Step 2: Create an index on the section column
CREATE INDEX IF NOT EXISTS idx_posts_section ON posts(section);

-- Step 3: Update existing posts to set section slug from section_id
UPDATE posts
SET section = sections.slug
FROM sections
WHERE posts.section_id = sections.id
AND posts.section IS NULL;

-- Step 4: Create a function to auto-sync section slug when section_id changes
CREATE OR REPLACE FUNCTION sync_post_section_slug()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.section_id IS NOT NULL THEN
    SELECT slug INTO NEW.section
    FROM sections
    WHERE id = NEW.section_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 5: Create trigger to auto-sync on insert/update
DROP TRIGGER IF EXISTS trigger_sync_post_section_slug ON posts;
CREATE TRIGGER trigger_sync_post_section_slug
  BEFORE INSERT OR UPDATE OF section_id ON posts
  FOR EACH ROW
  EXECUTE FUNCTION sync_post_section_slug();

-- Step 6: Do the same for category field
ALTER TABLE posts ADD COLUMN IF NOT EXISTS category TEXT;
CREATE INDEX IF NOT EXISTS idx_posts_category ON posts(category);

UPDATE posts
SET category = categories.slug
FROM categories
WHERE posts.category_id = categories.id
AND posts.category IS NULL;

CREATE OR REPLACE FUNCTION sync_post_category_slug()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.category_id IS NOT NULL THEN
    SELECT slug INTO NEW.category
    FROM categories
    WHERE id = NEW.category_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_sync_post_category_slug ON posts;
CREATE TRIGGER trigger_sync_post_category_slug
  BEFORE INSERT OR UPDATE OF category_id ON posts
  FOR EACH ROW
  EXECUTE FUNCTION sync_post_category_slug();

-- ============================================
-- VERIFY THE CHANGES
-- ============================================

SELECT 
  id,
  title,
  section,
  category,
  section_id,
  category_id
FROM posts
LIMIT 10;

-- ============================================
-- SUCCESS MESSAGE
-- ============================================

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '✅ ================================';
  RAISE NOTICE '✅ POSTS SECTION FIELD FIXED!';
  RAISE NOTICE '✅ ================================';
  RAISE NOTICE '';
  RAISE NOTICE '✅ Added section column (slug)';
  RAISE NOTICE '✅ Added category column (slug)';
  RAISE NOTICE '✅ Synced existing posts';
  RAISE NOTICE '✅ Created auto-sync triggers';
  RAISE NOTICE '';
  RAISE NOTICE '💡 Now when you create/edit posts:';
  RAISE NOTICE '   - Set section_id (UUID) in admin';
  RAISE NOTICE '   - section (slug) auto-syncs for frontend';
  RAISE NOTICE '';
END $$;
