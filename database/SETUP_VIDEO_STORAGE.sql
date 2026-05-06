-- ============================================
-- VIDEO & IMAGE STORAGE SETUP
-- ============================================
-- Run this script in Supabase SQL Editor to set up storage for video and image uploads

-- Step 1: Create storage buckets
-- ============================================

-- Create post-images bucket (for article images)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'post-images',
  'post-images',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

-- Create post-videos bucket (for article videos)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'post-videos',
  'post-videos',
  true,
  104857600, -- 100MB limit
  ARRAY['video/mp4', 'video/webm', 'video/ogg']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 104857600,
  allowed_mime_types = ARRAY['video/mp4', 'video/webm', 'video/ogg'];

-- Step 2: Set up storage policies
-- ============================================

-- POST-IMAGES POLICIES
-- ============================================

-- Allow authenticated users to upload images
CREATE POLICY "Allow authenticated image uploads" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'post-images' AND
    (storage.foldername(name))[1] = 'public'
  );

-- Allow public read access to images
CREATE POLICY "Allow public image read" ON storage.objects
  FOR SELECT TO public
  USING (bucket_id = 'post-images');

-- Allow authenticated users to update their images
CREATE POLICY "Allow authenticated image update" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'post-images')
  WITH CHECK (bucket_id = 'post-images');

-- Allow authenticated users to delete images
CREATE POLICY "Allow authenticated image delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'post-images');

-- POST-VIDEOS POLICIES
-- ============================================

-- Allow authenticated users to upload videos
CREATE POLICY "Allow authenticated video uploads" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'post-videos' AND
    (storage.foldername(name))[1] = 'public'
  );

-- Allow public read access to videos
CREATE POLICY "Allow public video read" ON storage.objects
  FOR SELECT TO public
  USING (bucket_id = 'post-videos');

-- Allow authenticated users to update their videos
CREATE POLICY "Allow authenticated video update" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'post-videos')
  WITH CHECK (bucket_id = 'post-videos');

-- Allow authenticated users to delete videos
CREATE POLICY "Allow authenticated video delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'post-videos');

-- Step 3: Verify setup
-- ============================================

-- Check buckets
SELECT 
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types,
  created_at
FROM storage.buckets
WHERE name IN ('post-images', 'post-videos');

-- Check policies on storage.objects table
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE schemaname = 'storage' 
AND tablename = 'objects'
AND (policyname LIKE '%image%' OR policyname LIKE '%video%')
ORDER BY policyname;

-- ============================================
-- TROUBLESHOOTING
-- ============================================

-- If uploads still fail, try these:

-- 1. Drop and recreate policies (if they conflict)
/*
DROP POLICY IF EXISTS "Allow authenticated image uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow public image read" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated image update" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated image delete" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated video uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow public video read" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated video update" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated video delete" ON storage.objects;
*/

-- 2. Temporarily disable RLS on storage.objects (NOT RECOMMENDED FOR PRODUCTION)
/*
ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY;
*/

-- 3. Re-enable RLS after testing
/*
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;
*/

-- ============================================
-- NOTES
-- ============================================

/*
BUCKET SETTINGS:
- post-images: 5MB limit, JPEG/PNG/GIF/WEBP
- post-videos: 100MB limit, MP4/WEBM/OGG

POLICIES:
- Authenticated users can upload, update, delete
- Public users can read (view) files
- Files must be in 'public' folder

USAGE IN APP:
- Upload: supabase.storage.from('post-videos').upload(path, file)
- Get URL: supabase.storage.from('post-videos').getPublicUrl(path)
- Delete: supabase.storage.from('post-videos').remove([path])

TESTING:
1. Try uploading a small video (<10MB) first
2. Check browser console for errors
3. Verify file appears in Supabase Storage dashboard
4. Test public URL in browser
*/
