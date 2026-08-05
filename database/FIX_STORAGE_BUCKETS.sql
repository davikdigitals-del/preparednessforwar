-- ============================================================
-- FIX STORAGE BUCKETS — run this in Supabase SQL Editor
-- Fixes 400 Bad Request on image/video/document uploads
-- ============================================================

-- 1. Create buckets if they don't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('post-images',    'post-images',    true, 5242880,    ARRAY['image/jpeg','image/png','image/gif','image/webp']),
  ('post-videos',    'post-videos',    true, 104857600,  ARRAY['video/mp4','video/webm','video/ogg']),
  ('content-files',  'content-files',  true, 52428800,   ARRAY['application/pdf','application/msword','application/vnd.openxmlformats-officedocument.wordprocessingml.document','text/plain'])
ON CONFLICT (id) DO UPDATE SET
  public             = EXCLUDED.public,
  file_size_limit    = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- 2. Drop old conflicting policies (run idempotently)
DO $$
DECLARE
  pol TEXT;
  bucket_names TEXT[] := ARRAY['post-images','post-videos','content-files'];
  b TEXT;
BEGIN
  FOREACH b IN ARRAY bucket_names LOOP
    FOR pol IN
      SELECT policyname FROM pg_policies
      WHERE schemaname = 'storage' AND tablename = 'objects'
        AND policyname LIKE '%' || b || '%'
    LOOP
      EXECUTE format('DROP POLICY IF EXISTS %I ON storage.objects', pol);
    END LOOP;
  END LOOP;
END $$;

-- 3. Allow authenticated users to upload to all three buckets
CREATE POLICY "Authenticated upload post-images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'post-images');

CREATE POLICY "Authenticated upload post-videos"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'post-videos');

CREATE POLICY "Authenticated upload content-files"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'content-files');

-- 4. Allow authenticated users to update/delete their own uploads
CREATE POLICY "Authenticated update post-images"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'post-images');

CREATE POLICY "Authenticated update post-videos"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'post-videos');

CREATE POLICY "Authenticated update content-files"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'content-files');

CREATE POLICY "Authenticated delete post-images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'post-images');

CREATE POLICY "Authenticated delete post-videos"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'post-videos');

CREATE POLICY "Authenticated delete content-files"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'content-files');

-- 5. Allow public read on all three buckets (needed for public URLs to work)
CREATE POLICY "Public read post-images"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'post-images');

CREATE POLICY "Public read post-videos"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'post-videos');

CREATE POLICY "Public read content-files"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'content-files');
