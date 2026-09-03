-- Check if admin user exists in profiles table
SELECT 
  id,
  email,
  is_admin,
  role,
  created_at
FROM profiles
WHERE is_admin = true OR role = 'admin'
LIMIT 5;

-- Check auth.users (actual Supabase auth users)
SELECT 
  id,
  email,
  created_at,
  last_sign_in_at
FROM auth.users
LIMIT 5;

-- If no admin profile exists, show this message
DO $$
DECLARE
  admin_count INT;
BEGIN
  SELECT COUNT(*) INTO admin_count
  FROM profiles
  WHERE is_admin = true OR role = 'admin';
  
  IF admin_count = 0 THEN
    RAISE NOTICE '';
    RAISE NOTICE '❌ NO ADMIN USER FOUND IN PROFILES TABLE';
    RAISE NOTICE '';
    RAISE NOTICE 'This is why pin button does not save!';
    RAISE NOTICE 'The UPDATE policy checks if user is admin in profiles table.';
    RAISE NOTICE '';
    RAISE NOTICE 'To fix: Set your user as admin with this command:';
    RAISE NOTICE 'UPDATE profiles SET is_admin = true WHERE email = ''your@email.com'';';
    RAISE NOTICE '';
  ELSE
    RAISE NOTICE '✅ Found % admin user(s)', admin_count;
  END IF;
END $$;
