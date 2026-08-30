-- Add quick_link_topic field to posts table to allow assigning posts to specific quick link topics

-- Add the column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'posts' AND column_name = 'quick_link_topic'
    ) THEN
        ALTER TABLE posts ADD COLUMN quick_link_topic text;
        COMMENT ON COLUMN posts.quick_link_topic IS 'Quick link topic slug that this post should appear on (e.g., emergency-kit, bug-out-bag)';
    END IF;
END $$;

-- Create index for quick lookup
CREATE INDEX IF NOT EXISTS idx_posts_quick_link_topic ON posts(quick_link_topic) WHERE quick_link_topic IS NOT NULL;

-- Enable RLS on posts table if not already enabled
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to recreate them
DROP POLICY IF EXISTS "Posts are viewable by everyone" ON posts;
DROP POLICY IF EXISTS "Admins can do everything with posts" ON posts;

-- Allow public read access to published posts
CREATE POLICY "Posts are viewable by everyone" 
ON posts FOR SELECT 
USING (true);

-- Allow admins full access to posts
CREATE POLICY "Admins can do everything with posts" 
ON posts FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.is_admin = true
  )
);

COMMENT ON TABLE posts IS 'Blog posts with support for quick link topic assignment';