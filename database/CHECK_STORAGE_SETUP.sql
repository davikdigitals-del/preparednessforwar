-- ============================================
-- CHECK STORAGE SETUP
-- ============================================
-- Run this to diagnose storage issues

-- Check if buckets exist
SELECT 
  id,
  name,
  public,
  created_at,
  updated_at
FROM storage.buckets
ORDER BY created_at DESC;

-- Check storage policies
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
ORDER BY policyname;

-- Check if RLS is enabled on storage.objects
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE schemaname = 'storage' 
AND tablename = 'objects';

-- Count files in each bucket
SELECT 
  bucket_id,
  COUNT(*) as file_count,
  pg_size_pretty(SUM(COALESCE((metadata->>'size')::bigint, 0))) as total_size
FROM storage.objects
GROUP BY bucket_id
ORDER BY file_count DESC;

-- Recent uploads (last 10)
SELECT 
  id,
  bucket_id,
  name,
  created_at,
  updated_at,
  metadata->>'size' as size_bytes,
  metadata->>'mimetype' as mime_type
FROM storage.objects
ORDER BY created_at DESC
LIMIT 10;
