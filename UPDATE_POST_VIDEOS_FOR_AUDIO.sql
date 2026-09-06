-- Update post-videos bucket to allow audio files
UPDATE storage.buckets 
SET allowed_mime_types = ARRAY[
  'video/mp4', 'video/webm', 'video/ogg', 'video/quicktime', 'video/x-msvideo',
  'audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/aac', 'audio/m4a', 'audio/flac'
]
WHERE name = 'post-videos';

-- Verify the update
SELECT 
  name,
  public,
  file_size_limit,
  allowed_mime_types
FROM storage.buckets 
WHERE name = 'post-videos';