-- ============================================================================
-- MAKE USER ADMIN IN PRODUCTION
-- ============================================================================
-- Run this in Supabase SQL Editor to fix admin login issues
-- 
-- INSTRUCTIONS:
-- 1. Replace 'your-admin-email@example.com' with your actual email
-- 2. Copy and paste this entire file into Supabase SQL Editor
-- 3. Click "Run" or press Ctrl+Enter
-- 4. Logout and login again at /admin-login
-- ============================================================================

-- Step 1: Check if user exists
SELECT 
  id,
  email,
  name,
  is_admin,
  role,
  created_at
FROM profiles 
WHERE email = 'your-admin-email@example.com';

-- If the above returns a row, continue with Step 2
-- If it returns nothing, the user doesn't exist - create account first at /admin-login

-- ============================================================================
-- Step 2: Set admin role in profiles table
-- ============================================================================

UPDATE profiles 
SET 
  is_admin = true,
  role = 'admin',
  updated_at = NOW()
WHERE email = 'your-admin-email@example.com';

-- ============================================================================
-- Step 3: Add admin role to user_roles table
-- ============================================================================

INSERT INTO user_roles (user_id, role)
SELECT id, 'admin' 
FROM profiles 
WHERE email = 'your-admin-email@example.com'
ON CONFLICT (user_id, role) 
DO UPDATE SET role = 'admin';

-- ============================================================================
-- Step 4: Verify the changes
-- ============================================================================

SELECT 
  p.id,
  p.email,
  p.name,
  p.is_admin,
  p.role as profile_role,
  ur.role as user_role,
  p.created_at,
  p.updated_at
FROM profiles p
LEFT JOIN user_roles ur ON p.id = ur.user_id
WHERE p.email = 'your-admin-email@example.com';

-- ============================================================================
-- EXPECTED RESULT:
-- ============================================================================
-- id: [some-uuid]
-- email: your-admin-email@example.com
-- name: Your Name
-- is_admin: true
-- profile_role: admin
-- user_role: admin
-- created_at: [timestamp]
-- updated_at: [timestamp]
-- ============================================================================

-- ✅ If you see is_admin = true and both roles = 'admin', you're done!
-- ✅ Now logout and login again at /admin-login
-- ✅ You should be redirected to /admin dashboard

-- ============================================================================
-- TROUBLESHOOTING
-- ============================================================================

-- If user doesn't exist:
-- 1. Go to your Render site: https://your-app.onrender.com/admin-login
-- 2. Click "Create Account" tab
-- 3. Create an account with your email
-- 4. Come back and run this SQL again

-- If still not working:
-- 1. Clear browser cache (Ctrl+Shift+Delete)
-- 2. Logout completely
-- 3. Close browser
-- 4. Open browser again
-- 5. Go to /admin-login and login

-- ============================================================================
-- MAKE MULTIPLE USERS ADMIN
-- ============================================================================

-- Uncomment and modify these lines to make multiple users admin:

-- UPDATE profiles SET is_admin = true, role = 'admin' WHERE email = 'admin1@example.com';
-- INSERT INTO user_roles (user_id, role) SELECT id, 'admin' FROM profiles WHERE email = 'admin1@example.com' ON CONFLICT DO NOTHING;

-- UPDATE profiles SET is_admin = true, role = 'admin' WHERE email = 'admin2@example.com';
-- INSERT INTO user_roles (user_id, role) SELECT id, 'admin' FROM profiles WHERE email = 'admin2@example.com' ON CONFLICT DO NOTHING;

-- UPDATE profiles SET is_admin = true, role = 'admin' WHERE email = 'admin3@example.com';
-- INSERT INTO user_roles (user_id, role) SELECT id, 'admin' FROM profiles WHERE email = 'admin3@example.com' ON CONFLICT DO NOTHING;

-- ============================================================================
-- LIST ALL ADMINS
-- ============================================================================

-- Run this to see all current admins:
SELECT 
  p.id,
  p.email,
  p.name,
  p.is_admin,
  p.role,
  ur.role as user_role
FROM profiles p
LEFT JOIN user_roles ur ON p.id = ur.user_id
WHERE p.is_admin = true OR ur.role = 'admin'
ORDER BY p.created_at DESC;

-- ============================================================================
-- REMOVE ADMIN ROLE (if needed)
-- ============================================================================

-- Uncomment to remove admin role from a user:
-- UPDATE profiles SET is_admin = false, role = 'member' WHERE email = 'user@example.com';
-- DELETE FROM user_roles WHERE user_id = (SELECT id FROM profiles WHERE email = 'user@example.com') AND role = 'admin';

-- ============================================================================
