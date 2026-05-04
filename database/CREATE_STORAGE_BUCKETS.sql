-- ============================================
-- CREATE STORAGE BUCKETS FOR FILE UPLOADS
-- Run this in Supabase SQL Editor
-- ============================================

-- Create post-images bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'post-images',
  'post-images',
  true,
  5242880, -- 5MB
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

-- Create post-videos bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'post-videos',
  'post-videos',
  true,
  104857600, -- 100MB
  ARRAY['video/mp4', 'video/webm', 'video/ogg']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 104857600,
  allowed_mime_types = ARRAY['video/mp4', 'video/webm', 'video/ogg'];

-- ============================================
-- STORAGE RLS POLICIES
-- ============================================

-- Allow public read on post-images
DROP POLICY IF EXISTS "Public read post-images" ON storage.objects;
CREATE POLICY "Public read post-images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'post-images');

-- Allow admins to upload post-images
DROP POLICY IF EXISTS "Admins upload post-images" ON storage.objects;
CREATE POLICY "Admins upload post-images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'post-images'
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- Allow admins to delete post-images
DROP POLICY IF EXISTS "Admins delete post-images" ON storage.objects;
CREATE POLICY "Admins delete post-images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'post-images'
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- Allow public read on post-videos
DROP POLICY IF EXISTS "Public read post-videos" ON storage.objects;
CREATE POLICY "Public read post-videos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'post-videos');

-- Allow admins to upload post-videos
DROP POLICY IF EXISTS "Admins upload post-videos" ON storage.objects;
CREATE POLICY "Admins upload post-videos"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'post-videos'
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- Allow admins to delete post-videos
DROP POLICY IF EXISTS "Admins delete post-videos" ON storage.objects;
CREATE POLICY "Admins delete post-videos"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'post-videos'
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- ============================================
-- VERIFY BUCKETS CREATED
-- ============================================
SELECT id, name, public, file_size_limit
FROM storage.buckets
WHERE id IN ('post-images', 'post-videos');

-- ============================================
-- DONE! Storage buckets are ready.
-- ============================================
