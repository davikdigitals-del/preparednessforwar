-- ============================================
-- ADVANCED FUNCTIONS FOR SENTINEL NETWORK
-- ============================================

-- ============================================
-- 1. SEARCH FUNCTIONS
-- ============================================

-- Full-text search for posts
CREATE OR REPLACE FUNCTION search_posts(search_query TEXT, limit_count INTEGER DEFAULT 20)
RETURNS TABLE (
  id UUID,
  title TEXT,
  standfirst TEXT,
  section TEXT,
  category TEXT,
  image TEXT,
  published_at TIMESTAMPTZ,
  relevance REAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.title,
    p.standfirst,
    p.section,
    p.category,
    p.image,
    p.published_at,
    ts_rank(
      to_tsvector('english', p.title || ' ' || COALESCE(p.standfirst, '') || ' ' || COALESCE(p.body, '')),
      plainto_tsquery('english', search_query)
    ) as relevance
  FROM posts p
  WHERE p.status = 'published'
    AND (
      to_tsvector('english', p.title || ' ' || COALESCE(p.standfirst, '') || ' ' || COALESCE(p.body, ''))
      @@ plainto_tsquery('english', search_query)
      OR p.tags && ARRAY[search_query]
    )
  ORDER BY relevance DESC, p.published_at DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 2. RECOMMENDATION FUNCTIONS
-- ============================================

-- Get related posts based on tags and category
CREATE OR REPLACE FUNCTION get_related_posts(post_uuid UUID, limit_count INTEGER DEFAULT 5)
RETURNS TABLE (
  id UUID,
  title TEXT,
  standfirst TEXT,
  image TEXT,
  section TEXT,
  category TEXT,
  published_at TIMESTAMPTZ
) AS $$
DECLARE
  post_tags TEXT[];
  post_category TEXT;
  post_section TEXT;
BEGIN
  SELECT tags, category, section INTO post_tags, post_category, post_section
  FROM posts WHERE id = post_uuid;

  RETURN QUERY
  SELECT 
    p.id,
    p.title,
    p.standfirst,
    p.image,
    p.section,
    p.category,
    p.published_at
  FROM posts p
  WHERE p.id != post_uuid
    AND p.status = 'published'
    AND (
      p.category = post_category
      OR p.section = post_section
      OR p.tags && post_tags
    )
  ORDER BY 
    CASE WHEN p.category = post_category THEN 3 ELSE 0 END +
    CASE WHEN p.section = post_section THEN 2 ELSE 0 END +
    CASE WHEN p.tags && post_tags THEN 1 ELSE 0 END DESC,
    p.published_at DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- Get personalized recommendations for user
CREATE OR REPLACE FUNCTION get_user_recommendations(user_uuid UUID, limit_count INTEGER DEFAULT 10)
RETURNS TABLE (
  id UUID,
  title TEXT,
  standfirst TEXT,
  image TEXT,
  section TEXT,
  category TEXT,
  published_at TIMESTAMPTZ,
  score INTEGER
) AS $$
BEGIN
  RETURN QUERY
  WITH user_interests AS (
    SELECT 
      p.section,
      p.category,
      UNNEST(p.tags) as tag,
      COUNT(*) as interest_score
    FROM user_activity ua
    JOIN posts p ON ua.post_id = p.id
    WHERE ua.user_id = user_uuid
      AND ua.activity_type IN ('view', 'bookmark', 'like')
    GROUP BY p.section, p.category, tag
  )
  SELECT 
    p.id,
    p.title,
    p.standfirst,
    p.image,
    p.section,
    p.category,
    p.published_at,
    (
      COALESCE((SELECT SUM(interest_score) FROM user_interests WHERE section = p.section), 0) +
      COALESCE((SELECT SUM(interest_score) FROM user_interests WHERE category = p.category), 0) +
      COALESCE((SELECT SUM(interest_score) FROM user_interests WHERE tag = ANY(p.tags)), 0)
    )::INTEGER as score
  FROM posts p
  WHERE p.status = 'published'
    AND p.id NOT IN (
      SELECT post_id FROM user_activity 
      WHERE user_id = user_uuid AND activity_type = 'view'
    )
  ORDER BY score DESC, p.published_at DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 3. ANALYTICS FUNCTIONS
-- ============================================

-- Get post statistics
CREATE OR REPLACE FUNCTION get_post_stats(post_uuid UUID)
RETURNS TABLE (
  views INTEGER,
  comments BIGINT,
  reactions BIGINT,
  bookmarks BIGINT,
  shares BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.view_count,
    COUNT(DISTINCT pc.id) as comments,
    COUNT(DISTINCT pr.id) as reactions,
    COUNT(DISTINCT b.id) as bookmarks,
    COUNT(DISTINCT ua.id) FILTER (WHERE ua.activity_type = 'share') as shares
  FROM posts p
  LEFT JOIN post_comments pc ON p.id = pc.post_id
  LEFT JOIN post_reactions pr ON p.id = pr.post_id
  LEFT JOIN bookmarks b ON p.id = b.post_id
  LEFT JOIN user_activity ua ON p.id = ua.post_id
  WHERE p.id = post_uuid
  GROUP BY p.id, p.view_count;
END;
$$ LANGUAGE plpgsql;

-- Get trending topics
CREATE OR REPLACE FUNCTION get_trending_topics(days INTEGER DEFAULT 7, limit_count INTEGER DEFAULT 10)
RETURNS TABLE (
  tag TEXT,
  post_count BIGINT,
  total_views BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    UNNEST(tags) as tag,
    COUNT(DISTINCT id) as post_count,
    SUM(view_count) as total_views
  FROM posts
  WHERE published_at >= NOW() - (days || ' days')::INTERVAL
    AND status = 'published'
  GROUP BY tag
  ORDER BY total_views DESC, post_count DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- Get section statistics
CREATE OR REPLACE FUNCTION get_section_stats()
RETURNS TABLE (
  section TEXT,
  post_count BIGINT,
  total_views BIGINT,
  avg_views NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.section,
    COUNT(*) as post_count,
    SUM(p.view_count) as total_views,
    AVG(p.view_count) as avg_views
  FROM posts p
  WHERE p.status = 'published'
  GROUP BY p.section
  ORDER BY total_views DESC;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 4. CONTENT MANAGEMENT FUNCTIONS
-- ============================================

-- Publish scheduled posts
CREATE OR REPLACE FUNCTION publish_scheduled_posts()
RETURNS INTEGER AS $$
DECLARE
  updated_count INTEGER;
BEGIN
  UPDATE posts
  SET status = 'published'
  WHERE status = 'draft'
    AND published_at <= NOW();
  
  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RETURN updated_count;
END;
$$ LANGUAGE plpgsql;

-- Archive old posts
CREATE OR REPLACE FUNCTION archive_old_posts(days_old INTEGER DEFAULT 365)
RETURNS INTEGER AS $$
DECLARE
  archived_count INTEGER;
BEGIN
  UPDATE posts
  SET status = 'archived'
  WHERE status = 'published'
    AND published_at < NOW() - (days_old || ' days')::INTERVAL;
  
  GET DIAGNOSTICS archived_count = ROW_COUNT;
  RETURN archived_count;
END;
$$ LANGUAGE plpgsql;

-- Clean up expired alerts
CREATE OR REPLACE FUNCTION cleanup_expired_alerts()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  UPDATE alerts
  SET is_active = false
  WHERE is_active = true
    AND expires_at IS NOT NULL
    AND expires_at < NOW();
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 5. USER ENGAGEMENT FUNCTIONS
-- ============================================

-- Track user reading progress
CREATE OR REPLACE FUNCTION track_reading_progress(
  user_uuid UUID,
  post_uuid UUID,
  progress_percent INTEGER
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO user_activity (user_id, post_id, activity_type, created_at)
  VALUES (user_uuid, post_uuid, 'view', NOW())
  ON CONFLICT DO NOTHING;
  
  IF progress_percent >= 80 THEN
    -- Consider it a full read
    INSERT INTO user_activity (user_id, post_id, activity_type, created_at)
    VALUES (user_uuid, post_uuid, 'complete_read', NOW())
    ON CONFLICT DO NOTHING;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Get user reading stats
CREATE OR REPLACE FUNCTION get_user_reading_stats(user_uuid UUID)
RETURNS TABLE (
  total_reads BIGINT,
  total_bookmarks BIGINT,
  total_comments BIGINT,
  favorite_section TEXT,
  reading_streak INTEGER
) AS $$
BEGIN
  RETURN QUERY
  WITH user_stats AS (
    SELECT 
      COUNT(DISTINCT CASE WHEN ua.activity_type = 'view' THEN ua.post_id END) as reads,
      COUNT(DISTINCT b.id) as bookmarks,
      COUNT(DISTINCT pc.id) as comments,
      (
        SELECT p.section
        FROM user_activity ua2
        JOIN posts p ON ua2.post_id = p.id
        WHERE ua2.user_id = user_uuid
        GROUP BY p.section
        ORDER BY COUNT(*) DESC
        LIMIT 1
      ) as fav_section
    FROM user_activity ua
    LEFT JOIN bookmarks b ON ua.user_id = b.user_id
    LEFT JOIN post_comments pc ON ua.user_id = pc.user_id
    WHERE ua.user_id = user_uuid
  ),
  streak AS (
    SELECT COUNT(DISTINCT DATE(created_at)) as days
    FROM user_activity
    WHERE user_id = user_uuid
      AND created_at >= NOW() - INTERVAL '30 days'
  )
  SELECT 
    us.reads,
    us.bookmarks,
    us.comments,
    us.fav_section,
    s.days::INTEGER
  FROM user_stats us, streak s;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 6. NOTIFICATION FUNCTIONS
-- ============================================

-- Create notification for user
CREATE OR REPLACE FUNCTION create_notification(
  user_uuid UUID,
  notif_title TEXT,
  notif_message TEXT,
  notif_type TEXT DEFAULT 'info',
  notif_link TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  new_notification_id UUID;
BEGIN
  INSERT INTO notifications (user_id, title, message, type, link)
  VALUES (user_uuid, notif_title, notif_message, notif_type, notif_link)
  RETURNING id INTO new_notification_id;
  
  RETURN new_notification_id;
END;
$$ LANGUAGE plpgsql;

-- Notify followers of new post
CREATE OR REPLACE FUNCTION notify_new_post(post_uuid UUID)
RETURNS INTEGER AS $$
DECLARE
  post_title TEXT;
  post_author TEXT;
  notification_count INTEGER := 0;
BEGIN
  SELECT title, author INTO post_title, post_author
  FROM posts WHERE id = post_uuid;
  
  -- This is a placeholder - you'd need a followers table
  -- For now, notify all active users
  INSERT INTO notifications (user_id, title, message, type, link)
  SELECT 
    id,
    'New Post: ' || post_title,
    'A new post by ' || post_author || ' has been published',
    'info',
    '/post/' || post_uuid
  FROM profiles
  WHERE is_admin = false;
  
  GET DIAGNOSTICS notification_count = ROW_COUNT;
  RETURN notification_count;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 7. MODERATION FUNCTIONS
-- ============================================

-- Auto-approve comments from trusted users
CREATE OR REPLACE FUNCTION auto_approve_trusted_comments()
RETURNS TRIGGER AS $$
BEGIN
  -- Auto-approve if user has 10+ approved comments
  IF (
    SELECT COUNT(*) 
    FROM post_comments 
    WHERE user_id = NEW.user_id AND is_approved = true
  ) >= 10 THEN
    NEW.is_approved := true;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER auto_approve_comments
  BEFORE INSERT ON post_comments
  FOR EACH ROW
  EXECUTE FUNCTION auto_approve_trusted_comments();

-- ============================================
-- 8. BACKUP & MAINTENANCE FUNCTIONS
-- ============================================

-- Get database statistics
CREATE OR REPLACE FUNCTION get_database_stats()
RETURNS TABLE (
  table_name TEXT,
  row_count BIGINT,
  total_size TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    schemaname || '.' || tablename as table_name,
    n_live_tup as row_count,
    pg_size_pretty(pg_total_relation_size(schemaname || '.' || tablename)) as total_size
  FROM pg_stat_user_tables
  ORDER BY pg_total_relation_size(schemaname || '.' || tablename) DESC;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- SCHEDULED JOBS (Run via pg_cron or external scheduler)
-- ============================================

-- Example: Run daily cleanup
-- SELECT cleanup_expired_alerts();
-- SELECT publish_scheduled_posts();
-- SELECT archive_old_posts(365);
