-- Run this in Supabase SQL Editor to check the countries table structure
-- Step 1: Check if table exists and what columns it has
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'countries'
ORDER BY ordinal_position;

-- Step 2: Check how many rows exist
SELECT COUNT(*) FROM countries;

-- Step 3: Check a sample row
SELECT * FROM countries LIMIT 3;

-- Step 4: Check RLS policies
SELECT policyname, cmd, roles
FROM pg_policies
WHERE tablename = 'countries';
