-- Fix Notifications Table - Add missing is_read column
-- Run this in Supabase SQL Editor

-- 1. Check if notifications table exists
SELECT 
  'Notifications Table' as check_type,
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'notifications')
    THEN '✅ EXISTS'
    ELSE '❌ MISSING'
  END as status;

-- 2. Add is_read column if it doesn't exist
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS is_read BOOLEAN DEFAULT false;

-- 3. Copy data from 'read' to 'is_read' if 'read' column exists, then drop 'read'
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'notifications' AND column_name = 'read'
  ) THEN
    -- Copy data from read to is_read
    UPDATE notifications SET is_read = read WHERE read IS NOT NULL;
    -- Drop the old read column
    ALTER TABLE notifications DROP COLUMN read;
  END IF;
END $$;

-- 4. Ensure all required columns exist
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS id UUID PRIMARY KEY DEFAULT gen_random_uuid();
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS title TEXT NOT NULL DEFAULT 'Notification';
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS message TEXT NOT NULL DEFAULT '';
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'info';
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS timestamp TIMESTAMPTZ DEFAULT now();
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT now();

-- 5. Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_timestamp ON notifications(timestamp DESC);

-- 6. Enable RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- 7. Drop existing policies
DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can insert own notifications" ON notifications;
DROP POLICY IF EXISTS "Allow users to read their own notifications" ON notifications;
DROP POLICY IF EXISTS "Allow users to update their own notifications" ON notifications;

-- 8. Create RLS policies
CREATE POLICY "Users can view own notifications" 
ON notifications
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can update own notifications" 
ON notifications
FOR UPDATE 
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can insert notifications" 
ON notifications
FOR INSERT 
TO authenticated
WITH CHECK (true);

-- 9. Verify the fix
SELECT 
  'Column Check' as info,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'notifications'
ORDER BY ordinal_position;

-- 10. Show current notifications
SELECT 
  'Current Notifications' as info,
  COUNT(*) as total_notifications,
  COUNT(*) FILTER (WHERE is_read = true) as read_count,
  COUNT(*) FILTER (WHERE is_read = false) as unread_count
FROM notifications;

-- Success message
SELECT '✅ Notifications table fixed! Column is_read now exists.' as status;
