-- Minimal script to create post-audios bucket
-- This should work without special permissions

-- Create the post-audios bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('post-audios', 'post-audios', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Verify it was created
SELECT name, public FROM storage.buckets WHERE name = 'post-audios';