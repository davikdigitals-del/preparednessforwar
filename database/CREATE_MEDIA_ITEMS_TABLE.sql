-- Create Media Items Table for Videos & Podcasts
-- This is separate from the posts system
-- Run this in Supabase SQL Editor

-- 1. Create media_items table
CREATE TABLE IF NOT EXISTS media_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  type TEXT NOT NULL CHECK (type IN ('video', 'podcast')),
  url TEXT NOT NULL,
  thumbnail TEXT,
  duration TEXT,
  author TEXT,
  tags TEXT[],
  is_premium BOOLEAN DEFAULT false,
  views INTEGER DEFAULT 0,
  published_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_media_items_type ON media_items(type);
CREATE INDEX IF NOT EXISTS idx_media_items_published_at ON media_items(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_media_items_is_premium ON media_items(is_premium);
CREATE INDEX IF NOT EXISTS idx_media_items_tags ON media_items USING GIN(tags);

-- 3. Enable RLS (Row Level Security)
ALTER TABLE media_items ENABLE ROW LEVEL SECURITY;

-- 4. Create RLS policies

-- Allow everyone to read published media items
CREATE POLICY "Allow public read access to media_items" 
ON media_items
FOR SELECT 
TO public
USING (true);

-- Allow authenticated users to read all media items
CREATE POLICY "Allow authenticated read all media_items" 
ON media_items
FOR SELECT 
TO authenticated
USING (true);

-- Allow authenticated users to insert media items
CREATE POLICY "Allow authenticated insert media_items" 
ON media_items
FOR INSERT 
TO authenticated
WITH CHECK (true);

-- Allow authenticated users to update media items
CREATE POLICY "Allow authenticated update media_items" 
ON media_items
FOR UPDATE 
TO authenticated
USING (true)
WITH CHECK (true);

-- Allow authenticated users to delete media items
CREATE POLICY "Allow authenticated delete media_items" 
ON media_items
FOR DELETE 
TO authenticated
USING (true);

-- 5. Create updated_at trigger function (if not exists)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 6. Create trigger for media_items
DROP TRIGGER IF EXISTS update_media_items_updated_at ON media_items;
CREATE TRIGGER update_media_items_updated_at
  BEFORE UPDATE ON media_items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 7. Create function to increment views
CREATE OR REPLACE FUNCTION increment_media_views(media_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE media_items 
  SET views = views + 1 
  WHERE id = media_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Insert sample data (optional - remove if you don't want sample data)
INSERT INTO media_items (title, description, type, url, thumbnail, duration, author, tags, is_premium)
VALUES 
  (
    'Survival Skills Training - Episode 1',
    'Learn essential survival skills for emergency situations',
    'video',
    'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800',
    '15:30',
    'Preparedness Team',
    ARRAY['survival', 'training', 'emergency'],
    false
  ),
  (
    'Preparedness Podcast - Water Purification',
    'Everything you need to know about purifying water in emergency situations',
    'podcast',
    'https://open.spotify.com/episode/example',
    'https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=800',
    '45:20',
    'John Doe',
    ARRAY['podcast', 'water', 'preparedness'],
    false
  )
ON CONFLICT DO NOTHING;

-- 9. Verify setup
SELECT 
  'Setup Status' as check_type,
  'media_items table' as item,
  CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'media_items') 
    THEN '✅ EXISTS' ELSE '❌ MISSING' END as status
UNION ALL
SELECT 
  'Indexes',
  'media_items indexes',
  COUNT(*)::text || ' indexes created'
FROM pg_indexes 
WHERE tablename = 'media_items'
UNION ALL
SELECT 
  'RLS Policies',
  'media_items policies',
  COUNT(*)::text || ' policies created'
FROM pg_policies 
WHERE tablename = 'media_items'
UNION ALL
SELECT 
  'Data',
  'Sample media items',
  COUNT(*)::text || ' items'
FROM media_items;

-- 10. Show sample data
SELECT 
  id,
  title,
  type,
  author,
  duration,
  views,
  is_premium
FROM media_items
ORDER BY published_at DESC
LIMIT 5;

-- Success message
SELECT '✅ Media items table created successfully!' as status,
       'Go to /admin/podcast-videos to manage videos and podcasts' as next_step;
