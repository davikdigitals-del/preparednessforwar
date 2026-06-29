-- ============================================
-- ADD PREMIUM COLUMNS TO CONTENT TABLES
-- Run this to enable premium content gating
-- ============================================

-- Add is_premium column to posts (if not exists)
ALTER TABLE posts
ADD COLUMN IF NOT EXISTS is_premium BOOLEAN DEFAULT false;

-- Add is_premium column to media_items (if not exists)
ALTER TABLE media_items
ADD COLUMN IF NOT EXISTS is_premium BOOLEAN DEFAULT false;

-- Add is_premium column to library_items (if not exists)
ALTER TABLE library_items
ADD COLUMN IF NOT EXISTS is_premium BOOLEAN DEFAULT false;

-- Create index for faster premium content queries
CREATE INDEX IF NOT EXISTS idx_posts_is_premium ON posts(is_premium);
CREATE INDEX IF NOT EXISTS idx_media_items_is_premium ON media_items(is_premium);
CREATE INDEX IF NOT EXISTS idx_library_items_is_premium ON library_items(is_premium);

-- Success message
DO $$
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE '✅ PREMIUM COLUMNS ADDED!';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Posts, media, and library items can now be marked as premium.';
  RAISE NOTICE 'Use the admin interface to mark content as premium.';
  RAISE NOTICE '========================================';
END $$;
