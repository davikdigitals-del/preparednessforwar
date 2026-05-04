## 🚀 Quick SQL Reference for Preparedness for War

Fast reference for common database operations.

---

## 📁 Files Overview

| File | Purpose | When to Use |
|------|---------|-------------|
| `schema.sql` | Main database structure | First-time setup |
| `functions.sql` | Advanced features | After schema setup |
| `sample-data.sql` | Test content | Development/testing |
| `migrations.sql` | Database updates | Updating existing DB |
| `SETUP_GUIDE.md` | Detailed instructions | Full setup guide |

---

## ⚡ Quick Commands

### 1. Initial Setup
```sql
-- Run in this order:
\i schema.sql
\i functions.sql
\i sample-data.sql  -- Optional: for testing
```

### 2. Create Admin User
```sql
-- After user signs up, make them admin:
UPDATE profiles 
SET is_admin = true, role = 'admin'
WHERE email = 'your-email@example.com';
```

### 3. Check Setup
```sql
-- Verify tables exist
SELECT COUNT(*) FROM information_schema.tables 
WHERE table_schema = 'public';

-- Should return ~30+ tables
```

---

## 🔍 Common Queries

### Posts

```sql
-- Get all published posts
SELECT * FROM posts WHERE status = 'published' ORDER BY published_at DESC;

-- Get posts by section
SELECT * FROM posts WHERE section = 'emergency' AND status = 'published';

-- Get pinned post
SELECT * FROM posts WHERE is_pinned = true AND status = 'published' LIMIT 1;

-- Search posts
SELECT * FROM search_posts('emergency preparedness', 10);

-- Get trending posts
SELECT * FROM get_trending_posts(7, 10);
```

### Users

```sql
-- Get all users
SELECT * FROM profiles ORDER BY created_at DESC;

-- Get admin users
SELECT * FROM profiles WHERE is_admin = true;

-- Get user stats
SELECT * FROM get_user_reading_stats('user-uuid-here');
```

### Analytics

```sql
-- Post statistics
SELECT * FROM get_post_stats('post-uuid-here');

-- Section statistics
SELECT * FROM get_section_stats();

-- Trending topics
SELECT * FROM get_trending_topics(7, 10);

-- Database stats
SELECT * FROM get_database_stats();
```

### Media

```sql
-- Get all videos
SELECT * FROM media_items WHERE type = 'video' ORDER BY published_at DESC;

-- Get all podcasts
SELECT * FROM media_items WHERE type = 'podcast' ORDER BY published_at DESC;

-- Most viewed media
SELECT * FROM media_items ORDER BY views DESC LIMIT 10;
```

---

## 🛠️ Maintenance

### Daily Tasks
```sql
-- Clean expired alerts
SELECT cleanup_expired_alerts();

-- Publish scheduled posts
SELECT publish_scheduled_posts();
```

### Weekly Tasks
```sql
-- Check database size
SELECT pg_size_pretty(pg_database_size(current_database()));

-- Check table sizes
SELECT * FROM get_database_stats();
```

### Monthly Tasks
```sql
-- Archive old posts (365+ days)
SELECT archive_old_posts(365);

-- Vacuum database
VACUUM ANALYZE;
```

---

## 🔐 Security

### Check RLS Policies
```sql
-- View all policies
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE schemaname = 'public';
```

### Test RLS
```sql
-- As anonymous user (should only see published)
SET ROLE anon;
SELECT COUNT(*) FROM posts;
RESET ROLE;

-- As authenticated user
SET ROLE authenticated;
SELECT COUNT(*) FROM posts;
RESET ROLE;
```

---

## 📊 Useful Views

### Published Posts with Stats
```sql
SELECT * FROM published_posts_with_author LIMIT 10;
```

### User Dashboard Stats
```sql
SELECT * FROM user_dashboard_stats WHERE user_id = 'uuid-here';
```

---

## 🐛 Troubleshooting

### Issue: No data showing
```sql
-- Check if posts exist
SELECT COUNT(*), status FROM posts GROUP BY status;

-- Check RLS is not blocking
ALTER TABLE posts DISABLE ROW LEVEL SECURITY;
SELECT COUNT(*) FROM posts;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
```

### Issue: Slow queries
```sql
-- Find slow queries
SELECT query, mean_exec_time, calls 
FROM pg_stat_statements 
ORDER BY mean_exec_time DESC 
LIMIT 10;

-- Check missing indexes
SELECT schemaname, tablename, attname, n_distinct, correlation
FROM pg_stats
WHERE schemaname = 'public'
  AND n_distinct > 100
  AND correlation < 0.1;
```

### Issue: Storage full
```sql
-- Check storage usage
SELECT 
  bucket_id,
  COUNT(*) as file_count,
  pg_size_pretty(SUM(size)) as total_size
FROM storage.objects
GROUP BY bucket_id;
```

---

## 💡 Pro Tips

### Bulk Operations
```sql
-- Bulk update post status
UPDATE posts 
SET status = 'published' 
WHERE status = 'draft' 
  AND published_at <= NOW();

-- Bulk delete old notifications
DELETE FROM notifications 
WHERE created_at < NOW() - INTERVAL '90 days' 
  AND is_read = true;
```

### Performance
```sql
-- Use EXPLAIN to analyze queries
EXPLAIN ANALYZE 
SELECT * FROM posts WHERE section = 'emergency';

-- Create custom indexes if needed
CREATE INDEX idx_custom ON posts(section, category, published_at DESC);
```

### Backup
```sql
-- Export specific table
COPY posts TO '/tmp/posts_backup.csv' CSV HEADER;

-- Import from CSV
COPY posts FROM '/tmp/posts_backup.csv' CSV HEADER;
```

---

## 📞 Quick Help

### Get Table Structure
```sql
\d posts  -- Describe posts table
\d+ posts -- Detailed description
```

### List All Tables
```sql
\dt  -- List tables
\dt+  -- List with sizes
```

### List All Functions
```sql
\df  -- List functions
\df+ search_posts  -- Describe specific function
```

### Connection Info
```sql
\conninfo  -- Show connection info
SELECT current_database();  -- Current database
SELECT current_user;  -- Current user
```

---

## 🎯 Common Workflows

### Publishing a Post
```sql
-- 1. Create draft
INSERT INTO posts (title, body, section, category, author, status)
VALUES ('Title', 'Content', 'emergency', 'alerts', 'Author', 'draft');

-- 2. Review and publish
UPDATE posts 
SET status = 'published', published_at = NOW()
WHERE id = 'post-uuid';

-- 3. Pin if featured
UPDATE posts SET is_pinned = true WHERE id = 'post-uuid';
```

### Managing Users
```sql
-- 1. Find user
SELECT * FROM profiles WHERE email = 'user@example.com';

-- 2. Make admin
UPDATE profiles SET is_admin = true, role = 'admin' WHERE id = 'user-uuid';

-- 3. Check their activity
SELECT * FROM user_activity WHERE user_id = 'user-uuid' ORDER BY created_at DESC;
```

### Content Moderation
```sql
-- 1. Get pending comments
SELECT * FROM post_comments WHERE is_approved = false;

-- 2. Approve comment
UPDATE post_comments SET is_approved = true WHERE id = 'comment-uuid';

-- 3. Delete spam
DELETE FROM post_comments WHERE id = 'comment-uuid';
```

---

## 📚 Additional Resources

- Full setup: `SETUP_GUIDE.md`
- Schema details: `schema.sql`
- Advanced features: `functions.sql`
- Updates: `migrations.sql`

---

## ✅ Checklist

Quick setup checklist:

- [ ] Run `schema.sql`
- [ ] Run `functions.sql`
- [ ] Create storage buckets
- [ ] Create admin user
- [ ] Test login
- [ ] Create test post
- [ ] Verify RLS working
- [ ] Check all pages load

**You're ready to go!** 🎉
