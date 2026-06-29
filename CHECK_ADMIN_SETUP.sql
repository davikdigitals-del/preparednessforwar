-- Check admin setup for debugging delete issues
-- Run this to verify your admin configuration

-- 1. Check if you have admin role
SELECT id, email, role, created_at 
FROM profiles 
WHERE role = 'admin';

-- 2. Check your current user info (will show the currently logged in user)
SELECT 
  auth.uid() as current_user_id,
  p.email, 
  p.role,
  CASE 
    WHEN p.role = 'admin' THEN 'YES - You are admin!' 
    ELSE 'NO - You need admin role' 
  END as admin_status
FROM profiles p 
WHERE p.id = auth.uid();

-- 3. Check current delete policies on member_reports
SELECT policyname, cmd, qual as policy_condition
FROM pg_policies 
WHERE tablename = 'member_reports' 
AND cmd = 'DELETE'
ORDER BY policyname;

-- 4. Test admin role check for current user
SELECT 
  auth.uid() as your_user_id,
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid()
    AND role = 'admin'
  ) as is_admin,
  CASE 
    WHEN EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin') 
    THEN 'You can delete reports' 
    ELSE 'You cannot delete reports - need admin role' 
  END as delete_permission;

-- 5. Check if member_reports table has RLS enabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'member_reports';

-- 6. Sample member reports to test deletion
SELECT id, title, status, user_id, created_at
FROM member_reports 
ORDER BY created_at DESC 
LIMIT 3;

-- 7. Count reports by status
SELECT status, COUNT(*) as count
FROM member_reports 
GROUP BY status
ORDER BY status;