-- ============================================
-- RUN THIS SCRIPT IN SUPABASE SQL EDITOR NOW
-- ============================================
-- This will fix all file upload issues and setup complete storage

-- Step 1: Create all storage buckets with proper configuration
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('post-images', 'post-images', true, 52428800, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
ON CONFLICT (id) DO UPDATE SET 
  public = true, 
  file_size_limit = 52428800, 
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('post-videos', 'post-videos', true, 104857600, ARRAY['video/mp4', 'video/webm', 'video/quicktime', 'audio/mpeg', 'audio/wav'])
ON CONFLICT (id) DO UPDATE SET 
  public = true, 
  file_size_limit = 104857600, 
  allowed_mime_types = ARRAY['video/mp4', 'video/webm', 'video/quicktime', 'audio/mpeg', 'audio/wav'];

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('content-files', 'content-files', true, 52428800, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4', 'video/webm', 'application/pdf'])
ON CONFLICT (id) DO UPDATE SET 
  public = true, 
  file_size_limit = 52428800, 
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4', 'video/webm', 'application/pdf'];

-- Step 2: Remove old policies if they exist
DROP POLICY IF EXISTS "Allow authenticated image uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow public image read" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated image update" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated image delete" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated video uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow public video read" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated video update" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated video delete" ON storage.objects;
DROP POLICY IF EXISTS "Public read access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated uploads" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated updates" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated deletes" ON storage.objects;
DROP POLICY IF EXISTS "Public can view content-files" ON storage.objects;
DROP POLICY IF EXISTS "Admins can upload content-files" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update content-files" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete content-files" ON storage.objects;

-- Step 3: Create comprehensive policies for all buckets
-- Post Images policies
CREATE POLICY "Allow authenticated image uploads" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'post-images');

CREATE POLICY "Allow public image read" ON storage.objects
  FOR SELECT TO public
  USING (bucket_id = 'post-images');

CREATE POLICY "Allow authenticated image update" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'post-images');

CREATE POLICY "Allow authenticated image delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'post-images');

-- Post Videos policies
CREATE POLICY "Allow authenticated video uploads" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'post-videos');

CREATE POLICY "Allow public video read" ON storage.objects
  FOR SELECT TO public
  USING (bucket_id = 'post-videos');

CREATE POLICY "Allow authenticated video update" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'post-videos');

CREATE POLICY "Allow authenticated video delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'post-videos');

-- Content Files policies
CREATE POLICY "Allow public content read" ON storage.objects
  FOR SELECT TO public
  USING (bucket_id = 'content-files');

CREATE POLICY "Allow authenticated content uploads" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'content-files');

CREATE POLICY "Allow authenticated content updates" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'content-files');

CREATE POLICY "Allow authenticated content deletes" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'content-files');

-- Step 4: Verify setup worked
SELECT id, name, public, file_size_limit FROM storage.buckets WHERE name IN ('post-images', 'post-videos', 'content-files') ORDER BY name;

-- You should see:
-- content-files | content-files | true | 52428800
-- post-images   | post-images   | true | 52428800  
-- post-videos   | post-videos   | true | 104857600

-- Step 5: Test storage URLs are accessible (optional)
-- Replace 'your-project-ref' with your actual Supabase project reference
-- Test URL format: https://your-project-ref.supabase.co/storage/v1/object/public/post-images/test-file.jpg
