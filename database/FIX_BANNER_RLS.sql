-- Fix banner_settings RLS policies + enable realtime
-- Run this in Supabase Dashboard → SQL Editor

-- 1. Enable RLS
ALTER TABLE banner_settings ENABLE ROW LEVEL SECURITY;

-- 2. Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "banner_public_read" ON banner_settings;
DROP POLICY IF EXISTS "banner_admin_write" ON banner_settings;
DROP POLICY IF EXISTS "Allow public read" ON banner_settings;
DROP POLICY IF EXISTS "Allow authenticated write" ON banner_settings;

-- 3. Allow everyone to read (needed for public site display)
CREATE POLICY "banner_public_read" ON banner_settings
  FOR SELECT USING (true);

-- 4. Allow authenticated users (admins) to insert/update/delete
CREATE POLICY "banner_admin_write" ON banner_settings
  FOR ALL USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- 5. Enable realtime so changes broadcast instantly without page refresh
ALTER PUBLICATION supabase_realtime ADD TABLE banner_settings;
