-- Add Simple Posts - Works with any posts table structure
-- Run this in Supabase SQL Editor

-- Insert posts using only the columns that definitely exist
INSERT INTO posts (
  title,
  author,
  content,
  excerpt,
  image_url,
  is_published
)
SELECT 
  'Article ' || generate_series || ': ' || 
  CASE (generate_series % 10)
    WHEN 0 THEN 'Emergency Preparedness Guide'
    WHEN 1 THEN 'Severe Weather Alert and Safety Tips'
    WHEN 2 THEN 'Earthquake Preparedness Essentials'
    WHEN 3 THEN 'Building Your Emergency Kit'
    WHEN 4 THEN 'Water Storage and Purification'
    WHEN 5 THEN 'First Aid Training Basics'
    WHEN 6 THEN 'Self-Defense Fundamentals'
    WHEN 7 THEN 'Wildfire Protection Strategies'
    WHEN 8 THEN 'Flood Warning Systems'
    WHEN 9 THEN 'Power Outage Preparedness'
  END,
  'Editorial Team',
  'This is a comprehensive article providing detailed information and expert insights. ' ||
  'Our team has researched extensively to bring you accurate and up-to-date information. ' ||
  'Stay informed and prepared with our practical advice and analysis.',
  'Essential information and expert guidance for preparedness.',
  CASE (generate_series % 8)
    WHEN 0 THEN 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800'
    WHEN 1 THEN 'https://images.unsplash.com/photo-1527482797697-8795b05a13fe?w=800'
    WHEN 2 THEN 'https://images.unsplash.com/photo-1564760055775-d63b17a55c44?w=800'
    WHEN 3 THEN 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=800'
    WHEN 4 THEN 'https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=800'
    WHEN 5 THEN 'https://images.unsplash.com/photo-1603398938378-e54eab446dde?w=800'
    WHEN 6 THEN 'https://images.unsplash.com/photo-1555597673-b21d5c935865?w=800'
    WHEN 7 THEN 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800'
  END,
  true
FROM generate_series(1, 30);

-- Show what was created
SELECT 
  COUNT(*) as total_posts,
  COUNT(*) FILTER (WHERE is_published = true) as published_posts
FROM posts;

-- Show sample posts
SELECT 
  id,
  title,
  author,
  is_published,
  created_at
FROM posts
ORDER BY created_at DESC
LIMIT 10;

SELECT '✅ Added 30 simple posts! Refresh your homepage.' as status;
