-- First check what tables exist and their structure before running the migration

-- 1. Check if nav_sections table exists and its structure
SELECT 'nav_sections table structure:' as info;
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'nav_sections' 
ORDER BY ordinal_position;

-- 2. Check if sections table exists and its structure  
SELECT 'sections table structure:' as info;
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'sections' 
ORDER BY ordinal_position;

-- 3. Check current health section data
SELECT 'Current nav_sections with health:' as info;
SELECT * FROM nav_sections WHERE slug LIKE '%health%';

-- 4. Check if sections table has health data
SELECT 'Current sections with health (if table exists):' as info;
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'sections') THEN
        EXECUTE 'SELECT * FROM sections WHERE slug LIKE ''%health%''';
    ELSE
        RAISE NOTICE 'sections table does not exist';
    END IF;
END $$;

-- 5. Check posts that use health section
SELECT 'Posts using health section:' as info;
SELECT COUNT(*) as count FROM posts WHERE section = 'health';
SELECT section, COUNT(*) FROM posts WHERE section LIKE '%health%' GROUP BY section;