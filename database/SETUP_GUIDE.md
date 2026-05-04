## 🗄️ Database Setup Guide for Preparedness for War

Complete guide to set up your Supabase database with all features.

---

## 📋 Prerequisites

1. **Supabase Account**: Sign up at [supabase.com](https://supabase.com)
2. **Project Created**: Create a new Supabase project
3. **SQL Editor Access**: Access to Supabase SQL Editor

---

## 🚀 Quick Setup (5 Steps)

### Step 1: Run Main Schema
```sql
-- Copy and paste the entire contents of schema.sql into Supabase SQL Editor
-- This creates all tables, indexes, and basic functions
```

### Step 2: Run Advanced Functions
```sql
-- Copy and paste the entire contents of functions.sql
-- This adds search, recommendations, analytics, and more
```

### Step 3: Create Storage Buckets

Go to **Storage** in Supabase Dashboard and create these buckets:

| Bucket Name | Public | Description |
|-------------|--------|-------------|
| `posts` | ✅ Yes | Post images and thumbnails |
| `media` | ✅ Yes | Videos and podcasts |
| `library` | ✅ Yes | Documents and PDFs |
| `avatars` | ✅ Yes | User profile pictures |
| `thumbnails` | ✅ Yes | Video thumbnails |

**Storage Policies** (for each bucket):
```sql
-- Allow public read access
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'posts');

-- Allow authenticated users to upload
CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'posts' AND auth.role() = 'authenticated');

-- Allow users to update their own files
CREATE POLICY "Users can update own files"
ON storage.objects FOR UPDATE
USING (bucket_id = 'posts' AND auth.uid()::text = owner);

-- Allow users to delete their own files
CREATE POLICY "Users can delete own files"
ON storage.objects FOR DELETE
USING (bucket_id = 'posts' AND auth.uid()::text = owner);
```

### Step 4: Configure Authentication

1. Go to **Authentication** → **Providers**
2. Enable **Email** provider
3. (Optional) Enable **Google**, **GitHub**, etc.
4. Configure email templates

### Step 5: Update Environment Variables

Create/update `.env` file:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

---

## 👤 Create Admin User

### Method 1: Via Supabase Dashboard

1. Go to **Authentication** → **Users**
2. Click **Add User**
3. Enter email and password
4. Click **Create User**
5. Run this SQL to make them admin:

```sql
-- Replace 'user-uuid-here' with actual user ID
UPDATE profiles 
SET is_admin = true, role = 'admin'
WHERE id = 'user-uuid-here';
```

### Method 2: Via SQL

```sql
-- Create admin user directly
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'admin@example.com',
  crypt('your-password', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW()
);

-- Then create profile
INSERT INTO profiles (id, email, name, role, is_admin)
SELECT 
  id,
  email,
  'Admin User',
  'admin',
  true
FROM auth.users
WHERE email = 'admin@example.com';
```

---

## 📊 Database Tables Overview

### Core Tables

| Table | Purpose | Key Features |
|-------|---------|--------------|
| `profiles` | User accounts | Extended auth.users with roles |
| `posts` | Articles/content | Full content management |
| `media_items` | Videos/podcasts | Media library |
| `library_items` | Documents/PDFs | Resource library |
| `encyclopaedia_entries` | A-Z reference | Knowledge base |
| `alerts` | Emergency alerts | Priority notifications |
| `notifications` | User notifications | In-app messaging |
| `bookmarks` | Saved articles | User collections |
| `post_comments` | Comments | Engagement |
| `newsletter_subscribers` | Email list | Marketing |

### Supporting Tables

- `sections` - Content sections
- `categories` - Content categories
- `countries` - Country data
- `pages` - Static pages
- `banner_settings` - Site banner
- `user_activity` - Analytics
- `page_views` - Traffic tracking
- `search_queries` - Search analytics

---

## 🔧 Advanced Features

### Full-Text Search

```sql
-- Search posts
SELECT * FROM search_posts('emergency preparedness', 10);
```

### Recommendations

```sql
-- Get related posts
SELECT * FROM get_related_posts('post-uuid-here', 5);

-- Get personalized recommendations
SELECT * FROM get_user_recommendations('user-uuid-here', 10);
```

### Analytics

```sql
-- Get trending posts
SELECT * FROM get_trending_posts(7, 10);

-- Get post statistics
SELECT * FROM get_post_stats('post-uuid-here');

-- Get section stats
SELECT * FROM get_section_stats();
```

### Content Management

```sql
-- Publish scheduled posts
SELECT publish_scheduled_posts();

-- Archive old posts (older than 365 days)
SELECT archive_old_posts(365);

-- Clean up expired alerts
SELECT cleanup_expired_alerts();
```

---

## 🔐 Security Configuration

### Row Level Security (RLS)

All tables have RLS enabled. Key policies:

**Posts:**
- ✅ Everyone can read published posts
- ✅ Only admins can create/edit/delete

**Comments:**
- ✅ Everyone can read approved comments
- ✅ Authenticated users can create
- ✅ Users can edit/delete own comments

**Bookmarks:**
- ✅ Users can only see/manage own bookmarks

**Notifications:**
- ✅ Users can only see own notifications

### API Keys

- **Anon Key**: Safe for client-side (respects RLS)
- **Service Key**: Server-side only (bypasses RLS)

---

## 📈 Performance Optimization

### Indexes Created

All critical indexes are automatically created:
- Post status, section, category
- Published dates
- User activity
- Full-text search
- Array fields (tags, country_codes)

### Query Optimization Tips

```sql
-- Use indexes
WHERE status = 'published' -- Uses idx_posts_status

-- Use prepared statements
PREPARE get_post AS SELECT * FROM posts WHERE id = $1;
EXECUTE get_post('uuid-here');

-- Use EXPLAIN to analyze queries
EXPLAIN ANALYZE SELECT * FROM posts WHERE section = 'emergency';
```

---

## 🧪 Testing Your Setup

### 1. Test Database Connection

```sql
SELECT NOW(); -- Should return current timestamp
```

### 2. Test Tables

```sql
-- Check all tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;
```

### 3. Test Functions

```sql
-- Test search
SELECT * FROM search_posts('test', 5);

-- Test trending
SELECT * FROM get_trending_posts(7, 5);
```

### 4. Test RLS

```sql
-- Should only show published posts
SELECT COUNT(*) FROM posts; -- As anonymous user
```

### 5. Test Storage

Upload a test file through the admin panel.

---

## 🔄 Maintenance Tasks

### Daily

```sql
-- Clean up expired alerts
SELECT cleanup_expired_alerts();

-- Publish scheduled posts
SELECT publish_scheduled_posts();
```

### Weekly

```sql
-- Get database stats
SELECT * FROM get_database_stats();

-- Check slow queries
SELECT * FROM pg_stat_statements 
ORDER BY mean_exec_time DESC 
LIMIT 10;
```

### Monthly

```sql
-- Archive old posts
SELECT archive_old_posts(365);

-- Vacuum database
VACUUM ANALYZE;
```

---

## 🐛 Troubleshooting

### Issue: Can't connect to database

**Solution:**
1. Check `.env` file has correct credentials
2. Verify Supabase project is active
3. Check network/firewall settings

### Issue: RLS blocking queries

**Solution:**
```sql
-- Temporarily disable RLS for testing (NOT for production!)
ALTER TABLE posts DISABLE ROW LEVEL SECURITY;

-- Re-enable after testing
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
```

### Issue: Slow queries

**Solution:**
```sql
-- Check missing indexes
SELECT * FROM pg_stat_user_tables 
WHERE idx_scan = 0 AND seq_scan > 0;

-- Analyze query performance
EXPLAIN ANALYZE your_query_here;
```

### Issue: Storage upload fails

**Solution:**
1. Check bucket exists
2. Verify storage policies
3. Check file size limits
4. Verify authentication

---

## 📚 Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Storage Guide](https://supabase.com/docs/guides/storage)

---

## ✅ Setup Checklist

- [ ] Run `schema.sql` in Supabase SQL Editor
- [ ] Run `functions.sql` in Supabase SQL Editor
- [ ] Create storage buckets (posts, media, library, avatars, thumbnails)
- [ ] Configure storage policies
- [ ] Enable authentication providers
- [ ] Create admin user
- [ ] Update `.env` file
- [ ] Test database connection
- [ ] Test admin login
- [ ] Test creating a post
- [ ] Test uploading media
- [ ] Verify RLS policies working

---

## 🎉 You're Done!

Your database is now fully configured with:
- ✅ All tables and relationships
- ✅ Full-text search
- ✅ Recommendations engine
- ✅ Analytics functions
- ✅ Security policies
- ✅ Storage buckets
- ✅ Admin user

**Next:** Start using the admin panel to add content!
