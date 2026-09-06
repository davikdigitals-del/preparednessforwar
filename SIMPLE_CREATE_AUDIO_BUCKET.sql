-- Simple script to create post-audios bucket
-- Run this in your Supabase SQL Editor

-- Create the post-audios bucket (public access)
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
  file_size_limit = 52428800,
  allowed_mime_types = ARRAY['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/aac', 'audio/m4a', 'audio/flac'];

-- Verify bucket was created
SELECT 
  name,
  public,
  file_size_limit / (1024*1024) as size_limit_mb,
  allowed_mime_types
FROM storage.buckets 
WHERE name = 'post-audios';

-- Check if any audio files already exist
SELECT 
  name, 
  bucket_id,
  metadata->>'size' as file_size,
  metadata->>'mimetype' as mime_type,
  created_at 
FROM storage.objects 
WHERE bucket_id = 'post-audios' 
ORDER BY created_at DESC 
LIMIT 5;