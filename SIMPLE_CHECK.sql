-- Simple check: How many posts exist total?
SELECT COUNT(*) as total_posts FROM posts;

-- How many are published?
SELECT COUNT(*) as published_posts FROM posts WHERE status = 'published';

-- Show me ANY 10 posts regardless of status
SELECT id, title, section, status FROM posts LIMIT 10;
