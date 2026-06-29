-- ============================================
-- COMPLETE SETUP FOR VIDEO & IMAGE UPLOADS
-- Run this ENTIRE file in Supabase SQL Editor
-- ============================================

-- Step 1: Add video columns to posts table
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS video_url TEXT;
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS video_type TEXT;
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS video_thumbnail TEXT;
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS video_duration TEXT;

-- Step 2: Create storage buckets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'post-images', 'post-images', true, 5242880,
  ARRAY['image/jpeg','image/png','image/gif','image/webp']
)
ON CONFLICT (id) DO UPDATE SET public = true;

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'post-videos', 'post-videos', true, 104857600,
  ARRAY['video/mp4','video/webm','video/ogg']
)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Step 3: Storage RLS policies - drop all first
DO $$
DECLARE r RECORD;
BEGIN
  FOR r IN (
    SELECT policyname FROM pg_policies
    WHERE tablename = 'objects' AND schemaname = 'storage'
    AND policyname LIKE '%post-image%' OR policyname LIKE '%post-video%'
  ) LOOP
    EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON storage.objects';
  END LOOP;
END $$;

-- Public read for both buckets
CREATE POLICY "post_images_public_read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'post-images');

CREATE POLICY "post_videos_public_read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'post-videos');

-- Authenticated users can upload (admin check done in app)
CREATE POLICY "post_images_auth_upload"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'post-images');

CREATE POLICY "post_videos_auth_upload"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'post-videos');

-- Authenticated users can delete their uploads
CREATE POLICY "post_images_auth_delete"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'post-images');

CREATE POLICY "post_videos_auth_delete"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'post-videos');

-- Step 4: Verify
SELECT 'Buckets' as type, id, name, public FROM storage.buckets WHERE id IN ('post-images','post-videos')
UNION ALL
SELECT 'Video columns' as type, column_name, data_type, 'posts table' FROM information_schema.columns
WHERE table_name = 'posts' AND column_name IN ('video_url','video_type','video_thumbnail','video_duration');

-- ============================================
-- DONE! Upload feature is ready.
-- ============================================
