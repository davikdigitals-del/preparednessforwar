-- Check if post-audios bucket exists
SELECT name, public, file_size_limit, allowed_mime_types 
FROM storage.buckets 
WHERE name = 'post-audios';

-- If it doesn't exist, create it
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'post-audios',
  'post-audios', 
  true, 
  52428800, -- 50MB limit
  ARRAY['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/aac', 'audio/m4a', 'audio/flac']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  allowed_mime_types = ARRAY['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/aac', 'audio/m4a', 'audio/flac'];

-- Enable RLS on storage.objects if not already enabled
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for post-audios bucket using storage.objects table

-- Allow public read access to post-audios
DROP POLICY IF EXISTS "Public read post-audios" ON storage.objects;
CREATE POLICY "Public read post-audios"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'post-audios');

-- Allow authenticated users to upload to post-audios  
DROP POLICY IF EXISTS "Authenticated upload post-audios" ON storage.objects;
CREATE POLICY "Authenticated upload post-audios"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'post-audios' AND auth.role() = 'authenticated');

-- Allow authenticated users to update their own files in post-audios
DROP POLICY IF EXISTS "Authenticated update post-audios" ON storage.objects;  
CREATE POLICY "Authenticated update post-audios"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'post-audios' AND auth.role() = 'authenticated');

-- Allow authenticated users to delete their own files in post-audios
DROP POLICY IF EXISTS "Authenticated delete post-audios" ON storage.objects;
CREATE POLICY "Authenticated delete post-audios" 
  ON storage.objects FOR DELETE
  USING (bucket_id = 'post-audios' AND auth.role() = 'authenticated');

-- Check that bucket was created successfully
SELECT 
  name,
  public,
  file_size_limit,
  allowed_mime_types
FROM storage.buckets 
WHERE name = 'post-audios';

-- Test query to check if files exist in the bucket
SELECT 
  name, 
  metadata->>'size' as file_size,
  metadata->>'mimetype' as mime_type,
  created_at 
FROM storage.objects 
WHERE bucket_id = 'post-audios' 
ORDER BY created_at DESC 
LIMIT 10;