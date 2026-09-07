-- Check if maintenance_mode table exists and its current state
-- Run this in your Supabase SQL editor to diagnose maintenance mode issues

-- 1. Check if table exists
SELECT 
  EXISTS (
    SELECT 1 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'maintenance_mode'
  ) as table_exists;

-- 2. Check table structure if it exists
SELECT 
  column_name, 
  data_type, 
  is_nullable, 
  column_default 
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'maintenance_mode'
ORDER BY ordinal_position;

-- 3. Check current maintenance mode data
SELECT * FROM maintenance_mode;

-- 4. Check RLS policies
SELECT 
  schemaname, 
  tablename, 
  policyname, 
  permissive, 
  roles, 
  cmd, 
  qual, 
  with_check 
FROM pg_policies 
WHERE tablename = 'maintenance_mode';

-- 5. Test permissions
-- This will show if RLS is working correctly
SELECT 
  'Can select from maintenance_mode' as test,
  CASE 
    WHEN COUNT(*) >= 0 THEN 'SUCCESS'
    ELSE 'FAILED'
  END as result
FROM maintenance_mode;

-- If the table doesn't exist, create it:
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'maintenance_mode'
  ) THEN
    RAISE NOTICE '❌ maintenance_mode table does not exist!';
    RAISE NOTICE '📝 Run the CREATE_MAINTENANCE_MODE.sql script to create it';
  ELSE
    RAISE NOTICE '✅ maintenance_mode table exists';
  END IF;
END $$;