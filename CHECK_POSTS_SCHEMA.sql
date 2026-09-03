-- Check what columns the posts table actually has
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'posts'
AND table_schema = 'public'
AND column_name IN ('status', 'is_published')
ORDER BY column_name;
