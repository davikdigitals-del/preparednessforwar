-- ============================================
-- ADD VIDEO SUPPORT TO POSTS
-- ============================================
-- This migration adds video upload capability to posts
-- Run this in Supabase SQL Editor
-- ============================================

-- Add video_url column to posts table
ALTER TABLE public.posts 
ADD COLUMN IF NOT EXISTS video_url TEXT;

-- Add video_type column to track video source
ALTER TABLE public.posts 
ADD COLUMN IF NOT EXISTS video_type TEXT CHECK (video_type IN ('youtube', 'vimeo', 'upload', 'url'));

-- Add video_thumbnail column for custom thumbnails
ALTER TABLE public.posts 
ADD COLUMN IF NOT EXISTS video_thumbnail TEXT;

-- Add video_duration column
ALTER TABLE public.posts 
ADD COLUMN IF NOT EXISTS video_duration TEXT;

-- Create index for video posts
CREATE INDEX IF NOT EXISTS idx_posts_video_url ON posts(video_url) WHERE video_url IS NOT NULL;

-- Add comment
COMMENT ON COLUMN posts.video_url IS 'URL to video file (uploaded or external like YouTube/Vimeo)';
COMMENT ON COLUMN posts.video_type IS 'Type of video: youtube, vimeo, upload (direct file), or url (other)';
COMMENT ON COLUMN posts.video_thumbnail IS 'Custom thumbnail for video (optional)';
COMMENT ON COLUMN posts.video_duration IS 'Video duration in format like "5:30" or "1:23:45"';

-- ============================================
-- VERIFICATION
-- ============================================

-- Check if columns were added successfully
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'posts' 
  AND column_name IN ('video_url', 'video_type', 'video_thumbnail', 'video_duration')
ORDER BY column_name;

-- ============================================
-- SUCCESS MESSAGE
-- ============================================

DO $$ 
BEGIN 
  RAISE NOTICE '✅ Video support added to posts table successfully!';
  RAISE NOTICE '';
  RAISE NOTICE 'New columns added:';
  RAISE NOTICE '  - video_url: Store video file URL or embed URL';
  RAISE NOTICE '  - video_type: Track video source (youtube/vimeo/upload/url)';
  RAISE NOTICE '  - video_thumbnail: Custom video thumbnail';
  RAISE NOTICE '  - video_duration: Video length';
  RAISE NOTICE '';
  RAISE NOTICE '📹 You can now upload videos or embed YouTube/Vimeo in posts!';
END $$;

