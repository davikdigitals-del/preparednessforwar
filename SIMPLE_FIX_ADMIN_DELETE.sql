-- Simple fix: Just add the missing admin delete policy
-- Run this in Supabase SQL Editor

-- First, check what delete policies currently exist
SELECT policyname FROM pg_policies 
WHERE tablename = 'member_reports' AND cmd = 'DELETE';

-- Add admin delete policy (with IF NOT EXISTS check)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'member_reports' 
    AND policyname = 'Admins can delete any reports'
  ) THEN
    CREATE POLICY "Admins can delete any reports" ON member_reports
      FOR DELETE USING (
        EXISTS (
          SELECT 1 FROM profiles 
          WHERE id = auth.uid() 
          AND role = 'admin'
        )
      );
    RAISE NOTICE 'Admin delete policy added successfully!';
  ELSE
    RAISE NOTICE 'Admin delete policy already exists - you are ready to go!';
  END IF;
END
$$;

-- Verify the policy was created
SELECT policyname, cmd FROM pg_policies 
WHERE tablename = 'member_reports' AND cmd = 'DELETE';