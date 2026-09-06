-- Check all storage buckets
SELECT 
  name,
  public,
  file_size_limit,
  allowed_mime_types,
  created_at
FROM storage.buckets 
ORDER BY created_at;

-- Check storage policies
SELECT 
  bucket_id,
  name,
  definition,
  check_expression,
  command
FROM storage.policies 
ORDER BY bucket_id, command;

-- Check recent objects in storage
SELECT 
  bucket_id,
  name,
  metadata->>'size' as file_size,
  metadata->>'mimetype' as mime_type,
  created_at
FROM storage.objects 
WHERE created_at > NOW() - INTERVAL '1 day'
ORDER BY created_at DESC;