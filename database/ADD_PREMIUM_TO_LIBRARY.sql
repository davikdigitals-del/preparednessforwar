-- ============================================================
-- ADD is_premium TO library_items AND courses
-- Run this in Supabase SQL Editor
-- ============================================================

-- library_items
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'library_items' AND column_name = 'is_premium'
  ) THEN
    ALTER TABLE library_items ADD COLUMN is_premium BOOLEAN DEFAULT false;
    RAISE NOTICE 'Added is_premium to library_items';
  END IF;
END $$;

-- courses
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'courses' AND column_name = 'is_premium'
  ) THEN
    ALTER TABLE courses ADD COLUMN is_premium BOOLEAN DEFAULT false;
    RAISE NOTICE 'Added is_premium to courses';
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_library_items_is_premium ON library_items(is_premium);
CREATE INDEX IF NOT EXISTS idx_courses_is_premium ON courses(is_premium);
