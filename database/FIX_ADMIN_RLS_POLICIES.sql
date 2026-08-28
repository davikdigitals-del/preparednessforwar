-- Fix Admin RLS Policies - Simple and Permissive
-- Run this to fix 500 errors

-- 1. Drop ALL existing policies on profiles and user_roles
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Users can view own roles" ON user_roles;
DROP POLICY IF EXISTS "Users can insert own roles" ON user_roles;
DROP POLICY IF EXISTS "Admins can manage all roles" ON user_roles;
DROP POLICY IF EXISTS "Enable read access for all users" ON profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON profiles;
DROP POLICY IF EXISTS "Enable update for users based on id" ON profiles;

-- 2. Ensure columns exist
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'member';

-- 3. Create user_roles table if not exists
CREATE TABLE IF NOT EXISTS user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('admin', 'editor', 'member')),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, role)
);

-- 4. Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- 5. Create SIMPLE and PERMISSIVE policies for profiles
-- Allow authenticated users to read all profiles
CREATE POLICY "Allow authenticated read all profiles" ON profiles
  FOR SELECT 
  TO authenticated
  USING (true);

-- Allow users to insert their own profile
CREATE POLICY "Allow users insert own profile" ON profiles
  FOR INSERT 
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY "Allow users update own profile" ON profiles
  FOR UPDATE 
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- 6. Create SIMPLE and PERMISSIVE policies for user_roles
-- Allow authenticated users to read all roles
CREATE POLICY "Allow authenticated read all roles" ON user_roles
  FOR SELECT 
  TO authenticated
  USING (true);

-- Allow users to insert their own roles
CREATE POLICY "Allow users insert own roles" ON user_roles
  FOR INSERT 
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own roles
CREATE POLICY "Allow users update own roles" ON user_roles
  FOR UPDATE 
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 7. Create indexes
CREATE INDEX IF NOT EXISTS idx_profiles_is_admin ON profiles(is_admin) WHERE is_admin = true;
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON user_roles(role);

-- 8. Verify setup
SELECT 
  'Setup Status' as check_type,
  'Profiles table' as item,
  CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles') 
    THEN '✅ EXISTS' ELSE '❌ MISSING' END as status
UNION ALL
SELECT 
  'Setup Status',
  'profiles.is_admin column',
  CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'is_admin') 
    THEN '✅ EXISTS' ELSE '❌ MISSING' END
UNION ALL
SELECT 
  'Setup Status',
  'user_roles table',
  CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_roles') 
    THEN '✅ EXISTS' ELSE '❌ MISSING' END
UNION ALL
SELECT 
  'RLS Policies',
  'profiles policies',
  COUNT(*)::text || ' policies'
FROM pg_policies WHERE tablename = 'profiles'
UNION ALL
SELECT 
  'RLS Policies',
  'user_roles policies',
  COUNT(*)::text || ' policies'
FROM pg_policies WHERE tablename = 'user_roles';

-- 9. Show current admins
SELECT 
  'Current Admins' as info,
  email,
  name,
  is_admin::text,
  role
FROM profiles 
WHERE is_admin = true;

-- Success message
SELECT '✅ RLS policies fixed! Try creating admin account now.' as status;
