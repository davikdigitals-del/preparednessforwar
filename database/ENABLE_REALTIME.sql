-- ============================================
-- ENABLE REAL-TIME UPDATES
-- Run this in Supabase SQL Editor
-- ============================================

-- Enable real-time for subscription_plans table
ALTER PUBLICATION supabase_realtime ADD TABLE subscription_plans;

-- Enable real-time for user_subscriptions table
ALTER PUBLICATION supabase_realtime ADD TABLE user_subscriptions;

-- Enable real-time for posts table (for content updates)
ALTER PUBLICATION supabase_realtime ADD TABLE posts;

-- Enable real-time for alerts table (for emergency alerts)
ALTER PUBLICATION supabase_realtime ADD TABLE alerts;

-- Enable real-time for notifications table (for user notifications)
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;

-- Enable real-time for profiles table (for user profile updates)
ALTER PUBLICATION supabase_realtime ADD TABLE profiles;

-- Verify real-time is enabled
SELECT 
    schemaname,
    tablename,
    'Real-time enabled' as status
FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime'
ORDER BY tablename;

-- ============================================
-- DONE! Real-time updates are now enabled
-- ============================================
-- Changes to these tables will now automatically
-- update in all connected clients without refresh
-- ============================================
