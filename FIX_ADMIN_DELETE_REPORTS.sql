-- Fix: Add admin delete policy for member_reports
-- This allows admins to delete any member reports

-- Check and add admin delete policy if it doesn't exist
DO $$
BEGIN
  -- Check if the admin delete policy already exists
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'member_reports' 
    AND policyname = 'Admins can delete any reports'
  ) THEN
    -- Create the admin delete policy
    CREATE POLICY "Admins can delete any reports" ON member_reports
      FOR DELETE USING (
        EXISTS (
          SELECT 1 FROM profiles 
          WHERE id = auth.uid() 
          AND role = 'admin'
        )
      );
    
    RAISE NOTICE 'Admin delete policy created for member_reports';
  ELSE
    RAISE NOTICE 'Admin delete policy already exists for member_reports';
  END IF;
END
$$;

-- Verify the delete policies are in place
SELECT schemaname, tablename, policyname, cmd
FROM pg_policies 
WHERE tablename = 'member_reports' 
AND cmd = 'DELETE'
ORDER BY policyname;