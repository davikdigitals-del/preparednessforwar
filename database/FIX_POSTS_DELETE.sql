-- ============================================
-- FIX POSTS DELETE PERMISSION
-- Run this in Supabase SQL Editor
-- ============================================

-- Drop existing delete policy if any
DROP POLICY IF EXISTS "Admins can delete posts" ON public.posts;
DROP POLICY IF EXISTS "posts_admin_delete" ON public.posts;

-- Create delete policy for admins
CREATE POLICY "posts_admin_delete"
  ON public.posts FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- Verify
SELECT policyname, cmd FROM pg_policies
WHERE tablename = 'posts' AND cmd = 'DELETE';
