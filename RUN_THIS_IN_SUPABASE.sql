-- ============================================
-- RUN THIS SCRIPT IN SUPABASE SQL EDITOR NOW
-- ============================================
-- This will fix all file upload issues

-- Step 1: Create the storage buckets
INSERT INTO storage.buckets (id, name, public)
VALUES ('post-images', 'post-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

INSERT INTO storage.buckets (id, name, public)
VALUES ('post-videos', 'post-videos', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Step 2: Remove old policies if they exist
DROP POLICY IF EXISTS "Allow authenticated image uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow public image read" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated image update" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated image delete" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated video uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow public video read" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated video update" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated video delete" ON storage.objects;

-- Step 3: Create policies for images
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

-- Step 4: Create policies for videos
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

-- Step 5: Verify it worked
SELECT id, name, public FROM storage.buckets WHERE name IN ('post-images', 'post-videos');

-- You should see:
-- post-images | post-images | true
-- post-videos | post-videos | true
