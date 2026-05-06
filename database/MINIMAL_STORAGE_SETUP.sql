-- ============================================
-- MINIMAL STORAGE SETUP (No RLS Policies)
-- ============================================
-- Use this if the full setup script fails
-- This creates buckets without RLS policies

-- Create post-images bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('post-images', 'post-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Create post-videos bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('post-videos', 'post-videos', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Disable RLS on storage.objects (for testing only)
ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY;

-- Verify buckets exist
SELECT id, name, public, created_at
FROM storage.buckets
WHERE name IN ('post-images', 'post-videos');

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Minimal storage setup complete!';
  RAISE NOTICE '';
  RAISE NOTICE '⚠️  WARNING: RLS is disabled on storage.objects';
  RAISE NOTICE '   This is for TESTING ONLY';
  RAISE NOTICE '   Anyone can upload/delete files';
  RAISE NOTICE '';
  RAISE NOTICE 'Buckets created:';
  RAISE NOTICE '  - post-images';
  RAISE NOTICE '  - post-videos';
  RAISE NOTICE '';
  RAISE NOTICE 'Try uploading a video now!';
END $$;
