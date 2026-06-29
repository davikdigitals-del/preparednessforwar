-- ============================================================================
-- FIX ADMIN FOR davikdigitals@gmail.com
-- ============================================================================
-- Your profile exists but is_admin and role are NULL/undefined
-- This will fix it immediately
-- ============================================================================

-- Step 1: Check current state
SELECT 
  id,
  email,
  name,
  is_admin,
  role,
  country,
  created_at
FROM profiles 
WHERE email = 'davikdigitals@gmail.com';

-- Step 2: If profile exists but is_admin is NULL, update it
UPDATE profiles 
SET 
  is_admin = true,
  role = 'admin',
  updated_at = NOW()
WHERE email = 'davikdigitals@gmail.com';

-- Step 3: Add to user_roles table
INSERT INTO user_roles (user_id, role)
SELECT id, 'admin' 
FROM profiles 
WHERE email = 'davikdigitals@gmail.com'
ON CONFLICT (user_id, role) 
DO UPDATE SET role = 'admin';

-- Step 4: Verify the fix
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
LEFT JOIN user_roles ur ON p.id = ur.user_id AND ur.role = 'admin'
WHERE p.email = 'davikdigitals@gmail.com';

-- ============================================================================
-- EXPECTED RESULT:
-- ============================================================================
-- email: davikdigitals@gmail.com
-- is_admin: true
-- profile_role: admin
-- user_role: admin
-- ============================================================================

-- Step 5: If profile doesn't exist at all, create it
INSERT INTO profiles (id, email, name, is_admin, role, country)
SELECT 
  auth.uid(),
  'davikdigitals@gmail.com',
  'Admin',
  true,
  'admin',
  'GB'
FROM auth.users
WHERE email = 'davikdigitals@gmail.com'
ON CONFLICT (id) 
DO UPDATE SET 
  is_admin = true,
  role = 'admin',
  updated_at = NOW();

-- ============================================================================
-- DONE! NOW:
-- ============================================================================
-- 1. Logout completely from your site
-- 2. Close browser
-- 3. Open browser again
-- 4. Go to /admin-login
-- 5. Login with davikdigitals@gmail.com
-- 6. Should redirect to /admin and work!
-- ============================================================================
