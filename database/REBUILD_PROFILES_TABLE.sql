-- Rebuild Profiles and User Roles Tables
-- WARNING: This will drop and recreate the tables
-- Only run if you're okay losing existing profile data

-- 1. Drop existing tables (CASCADE removes dependencies)
DROP TABLE IF EXISTS user_roles CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- 2. Create profiles table with all required columns
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  country TEXT DEFAULT 'GB',
  avatar_url TEXT,
  is_admin BOOLEAN DEFAULT false,
  role TEXT DEFAULT 'member',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Create user_roles table
CREATE TABLE user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('admin', 'editor', 'member')),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, role)
);

-- 4. Create indexes
CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_profiles_is_admin ON profiles(is_admin) WHERE is_admin = true;
CREATE INDEX idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX idx_user_roles_role ON user_roles(role);

-- 5. Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- 6. Create policies for profiles - VERY PERMISSIVE
CREATE POLICY "Allow all authenticated users full access to profiles" 
ON profiles
FOR ALL 
TO authenticated
USING (true)
WITH CHECK (true);

-- 7. Create policies for user_roles - VERY PERMISSIVE
CREATE POLICY "Allow all authenticated users full access to user_roles" 
ON user_roles
FOR ALL 
TO authenticated
USING (true)
WITH CHECK (true);

-- 8. Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 9. Create trigger for profiles
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 10. Verify setup
SELECT 
  'Tables created' as status,
  table_name,
  '✅' as result
FROM information_schema.tables 
WHERE table_name IN ('profiles', 'user_roles')
ORDER BY table_name;

SELECT 
  'Policies created' as status,
  tablename,
  COUNT(*)::text || ' policies' as result
FROM pg_policies 
WHERE tablename IN ('profiles', 'user_roles')
GROUP BY tablename;

SELECT '✅ Tables rebuilt successfully! Try creating admin account now.' as final_status;
