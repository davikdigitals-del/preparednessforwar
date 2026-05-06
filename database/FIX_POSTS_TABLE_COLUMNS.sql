-- Fix Posts Table - Add Missing Columns
-- Run this in Supabase SQL Editor

-- 1. Add views column if it doesn't exist
ALTER TABLE posts ADD COLUMN IF NOT EXISTS views INTEGER DEFAULT 0;

-- 2. Add other potentially missing columns
ALTER TABLE posts ADD COLUMN IF NOT EXISTS video_url TEXT;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS is_premium BOOLEAN DEFAULT false;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS country_codes TEXT[] DEFAULT '{}';
ALTER TABLE posts ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';

-- 3. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_posts_views ON posts(views DESC);
CREATE INDEX IF NOT EXISTS idx_posts_is_premium ON posts(is_premium);

-- 4. Verify the fix
SELECT 
  'Posts Table Columns' as info,
  column_name,
  data_type,
  column_default
FROM information_schema.columns 
WHERE table_name = 'posts'
  AND column_name IN ('views', 'video_url', 'is_premium', 'country_codes', 'tags')
ORDER BY column_name;

-- Success message
SELECT '✅ Posts table fixed! Missing columns added.' as status;
