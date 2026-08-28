-- ============================================
-- SIMPLE VIDEO & IMAGE STORAGE SETUP
-- ============================================
-- Run this script in Supabase SQL Editor
-- This is a simplified version that works with all Supabase versions

-- ============================================
-- STEP 1: Create Storage Buckets
-- ============================================

-- Create post-images bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('post-images', 'post-images', true)
ON CONFLICT (id) DO UPDATE SET
  public = true;

-- Create post-videos bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('post-videos', 'post-videos', true)
ON CONFLICT (id) DO UPDATE SET
  public = true;

-- ============================================
-- STEP 2: Create Storage Policies
-- ============================================

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Allow authenticated image uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow public image read" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated image update" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated image delete" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated video uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow public video read" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated video update" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated video delete" ON storage.objects;

-- IMAGE POLICIES
-- Allow authenticated users to upload images
CREATE POLICY "Allow authenticated image uploads" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'post-images');

-- Allow everyone to read images
CREATE POLICY "Allow public image read" ON storage.objects
  FOR SELECT TO public
  USING (bucket_id = 'post-images');

-- Allow authenticated users to update images
CREATE POLICY "Allow authenticated image update" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'post-images');

-- Allow authenticated users to delete images
CREATE POLICY "Allow authenticated image delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'post-images');

-- VIDEO POLICIES
-- Allow authenticated users to upload videos
CREATE POLICY "Allow authenticated video uploads" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'post-videos');

-- Allow everyone to read videos
CREATE POLICY "Allow public video read" ON storage.objects
  FOR SELECT TO public
  USING (bucket_id = 'post-videos');

-- Allow authenticated users to update videos
CREATE POLICY "Allow authenticated video update" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'post-videos');

-- Allow authenticated users to delete videos
CREATE POLICY "Allow authenticated video delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'post-videos');

-- ============================================
-- STEP 3: Verify Setup
-- ============================================

-- Check if buckets were created
SELECT id, name, public, created_at
FROM storage.buckets
WHERE name IN ('post-images', 'post-videos');

-- Check if policies were created
SELECT schemaname, tablename, policyname, cmd
FROM pg_policies
WHERE schemaname = 'storage' 
AND tablename = 'objects'
AND (policyname LIKE '%image%' OR policyname LIKE '%video%')
ORDER BY policyname;

-- ============================================
-- SUCCESS MESSAGE
-- ============================================

DO $$
BEGIN
  RAISE NOTICE '✅ Storage setup complete!';
  RAISE NOTICE '';
  RAISE NOTICE 'Buckets created:';
  RAISE NOTICE '  - post-images (for article images)';
  RAISE NOTICE '  - post-videos (for article videos)';
  RAISE NOTICE '';
  RAISE NOTICE 'Policies created:';
  RAISE NOTICE '  - Authenticated users can upload/update/delete';
  RAISE NOTICE '  - Public users can read/view files';
  RAISE NOTICE '';
  RAISE NOTICE 'Next steps:';
  RAISE NOTICE '  1. Go to Admin Panel → Posts';
  RAISE NOTICE '  2. Create a new post';
  RAISE NOTICE '  3. Try uploading a video or pasting a YouTube URL';
  RAISE NOTICE '';
END $$;
