-- ============================================
-- CHECK YOUR ACTUAL DATABASE SCHEMA
-- Run this first to see what columns exist
-- ============================================

-- Check posts table structure
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'posts'
ORDER BY ordinal_position;

-- Check all tables that exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;
