-- ============================================
-- CLEAN START - DROP OLD TABLES FIRST
-- ============================================
-- This drops your old tables and creates everything fresh
-- ⚠️ WARNING: This deletes ALL existing data!
-- ============================================

-- Drop all tables in correct order (respecting foreign keys)
DROP TABLE IF EXISTS page_views CASCADE;
DROP TABLE IF EXISTS search_queries CASCADE;
DROP TABLE IF EXISTS newsletter_campaigns CASCADE;
DROP TABLE IF EXISTS newsletter_subscribers CASCADE;
DROP TABLE IF EXISTS pages CASCADE;
DROP TABLE IF EXISTS banner_settings CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS alerts CASCADE;
DROP TABLE IF EXISTS encyclopaedia_entries CASCADE;
DROP TABLE IF EXISTS file_uploads CASCADE;
DROP TABLE IF EXISTS library_items CASCADE;
DROP TABLE IF EXISTS media_items CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS sections CASCADE;
DROP TABLE IF EXISTS bookmarks CASCADE;
DROP TABLE IF EXISTS post_reactions CASCADE;
DROP TABLE IF EXISTS post_comments CASCADE;
DROP TABLE IF EXISTS post_revisions CASCADE;
DROP TABLE IF EXISTS posts CASCADE;
DROP TABLE IF EXISTS user_activity CASCADE;
DROP TABLE IF EXISTS user_preferences CASCADE;
DROP TABLE IF EXISTS user_roles CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;
DROP TABLE IF EXISTS countries CASCADE;

-- Drop functions
DROP FUNCTION IF EXISTS get_trending_posts CASCADE;
DROP FUNCTION IF EXISTS increment_post_views CASCADE;
DROP FUNCTION IF EXISTS update_updated_at_column CASCADE;
