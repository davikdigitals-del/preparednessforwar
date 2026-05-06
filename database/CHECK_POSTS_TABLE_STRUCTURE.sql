-- Check Posts Table Structure
-- Run this to see the actual columns

SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'posts'
ORDER BY ordinal_position;
