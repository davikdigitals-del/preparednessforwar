-- COMPLETE ADMIN DELETE FIX
-- This script will:
-- 1. Check your admin status
-- 2. Add missing admin delete policy
-- 3. Verify everything is working

-- Step 1: Show your current admin status
SELECT 
  'YOUR ADMIN STATUS:' as info,
  auth.uid() as your_user_id,
  p.email,
  p.role,
  CASE 
    WHEN p.role = 'admin' THEN '✅ YOU ARE ADMIN' 
    ELSE '❌ YOU NEED ADMIN ROLE' 
  END as status
FROM profiles p 
WHERE p.id = auth.uid();

-- Step 2: Check existing delete policies
SELECT 
  '=== CURRENT DELETE POLICIES ===' as info,
  policyname
FROM pg_policies 
WHERE tablename = 'member_reports' 
AND cmd = 'DELETE';

-- Step 3: Add admin delete policy (safe - won't duplicate)
DO $$
BEGIN
  -- Only create if it doesn't exist
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
    
    RAISE NOTICE '✅ Admin delete policy created successfully!';
  ELSE
    RAISE NOTICE '✅ Admin delete policy already exists!';
  END IF;
END
$$;

-- Step 4: Verify the fix worked
SELECT 
  '=== FINAL VERIFICATION ===' as info,
  policyname,
  'DELETE' as permission_type
FROM pg_policies 
WHERE tablename = 'member_reports' 
AND cmd = 'DELETE'
ORDER BY policyname;

-- Step 5: Test deletion permission for current user
SELECT 
  '=== YOUR DELETE PERMISSION ===' as info,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role = 'admin'
    ) THEN '✅ YOU CAN DELETE MEMBER REPORTS'
    ELSE '❌ YOU CANNOT DELETE - CHECK YOUR ADMIN ROLE'
  END as result;

-- Done! You should now be able to delete member reports in the admin panel.