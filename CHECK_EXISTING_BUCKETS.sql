-- Check what storage buckets actually exist
SELECT 
  name,
  public,
  file_size_limit,
  allowed_mime_types,
  created_at
FROM storage.buckets 
ORDER BY name;

-- Check recent storage activity
SELECT 
  bucket_id,
  name,
  metadata->>'size' as file_size,
  metadata->>'mimetype' as mime_type,
  created_at
FROM storage.objects 
WHERE created_at > NOW() - INTERVAL '7 days'
ORDER BY created_at DESC
LIMIT 20;