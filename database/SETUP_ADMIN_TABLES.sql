-- Setup Admin Tables and Policies
-- Run this in Supabase SQL Editor to ensure admin login works

-- 1. Ensure profiles table has correct columns
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'member';

-- 2. Ensure user_roles table exists
CREATE TABLE IF NOT EXISTS user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('admin', 'editor', 'member')),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, role)
);

-- 3. Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_is_admin ON profiles(is_admin) WHERE is_admin = true;
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON user_roles(role);

-- 4. Enable RLS on both tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- 5. Drop existing policies (if any)
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can view own roles" ON user_roles;
DROP POLICY IF EXISTS "Users can insert own roles" ON user_roles;
DROP POLICY IF EXISTS "Admins can manage all roles" ON user_roles;

-- 6. Create RLS policies for profiles
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- 7. Create RLS policies for user_roles
CREATE POLICY "Users can view own roles" ON user_roles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own roles" ON user_roles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage all roles" ON user_roles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- 8. Create function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = user_id AND is_admin = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. Create function to make first user admin (bootstrap)
CREATE OR REPLACE FUNCTION bootstrap_first_admin()
RETURNS TRIGGER AS $$
BEGIN
  -- If this is the first user, make them admin
  IF (SELECT COUNT(*) FROM profiles) = 0 THEN
    NEW.is_admin := true;
    NEW.role := 'admin';
    
    -- Also insert into user_roles
    INSERT INTO user_roles (user_id, role)
    VALUES (NEW.id, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 10. Create trigger for first admin bootstrap
DROP TRIGGER IF EXISTS bootstrap_first_admin_trigger ON profiles;
CREATE TRIGGER bootstrap_first_admin_trigger
  BEFORE INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION bootstrap_first_admin();

-- 11. Verify setup
SELECT 
  'Profiles table' as table_name,
  COUNT(*) as total_users,
  COUNT(*) FILTER (WHERE is_admin = true) as admin_users
FROM profiles
UNION ALL
SELECT 
  'User roles table' as table_name,
  COUNT(*) as total_roles,
  COUNT(*) FILTER (WHERE role = 'admin') as admin_roles
FROM user_roles;

-- 12. Show all admins
SELECT 
  p.id,
  p.email,
  p.name,
  p.is_admin,
  p.role,
  array_agg(ur.role) as roles
FROM profiles p
LEFT JOIN user_roles ur ON p.id = ur.user_id
WHERE p.is_admin = true
GROUP BY p.id, p.email, p.name, p.is_admin, p.role;

-- Setup complete message
SELECT 
  '✅ Admin tables and policies setup complete!' as status,
  'First user to register will automatically become admin' as note1,
  'Or use /admin-login to create admin account' as note2;
