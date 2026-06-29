# 🎯 CLEAN STATE DATABASE SETUP

## Complete Fresh Start Guide

This guide provides a **nuclear clean** approach to setting up your Preparedness for War database from scratch.

---

## 📋 Prerequisites

- Supabase project created
- Project ID configured in `supabase/config.toml`
- Access to Supabase SQL Editor

---

## 🚀 Setup Steps (Run in Order)

### Step 1: Core Schema & Data
**File:** `ALL_IN_ONE_COMPLETE.sql`

This creates all tables, sample data, and basic structure.

```sql
-- Run this entire file in Supabase SQL Editor
-- It will drop existing tables and recreate everything
```

**What it does:**
- ✅ Drops all existing tables (clean slate)
- ✅ Creates all core tables (posts, media, library, etc.)
- ✅ Adds sample data (10 posts, 6 media items, etc.)
- ✅ Creates indexes for performance

---

### Step 2: Roles & Authentication
**File:** `ROLES_SETUP.sql`

This sets up the authentication and role system.

```sql
-- Run this entire file in Supabase SQL Editor
```

**What it does:**
- ✅ Creates `profiles` table (if not exists)
- ✅ Creates `user_roles` table with admin/member roles
- ✅ Sets up Row Level Security (RLS) policies
- ✅ Creates `handle_new_user()` trigger for auto-profile creation
- ✅ Creates `assign_admin_role()` function

**Important:** This uses a nuclear clean approach - it drops all existing triggers and functions first.

---

### Step 3: Storage Buckets
**File:** `STORAGE_SETUP.sql`

This creates the storage bucket for media uploads.

```sql
-- Run this entire file in Supabase SQL Editor
```

**What it does:**
- ✅ Creates `content-files` bucket (50MB limit)
- ✅ Allows public read access
- ✅ Allows authenticated users to upload/update/delete
- ✅ Configures allowed MIME types (images, videos, audio, PDFs, docs)

---

### Step 4: Premium & Subscriptions
**File:** `PREMIUM_SUBSCRIPTIONS.sql`

This adds premium content features and subscription management.

```sql
-- Run this entire file in Supabase SQL Editor
```

**What it does:**
- ✅ Adds `is_premium` flag to posts, media_items, library_items
- ✅ Creates `subscription_plans` table
- ✅ Creates `user_subscriptions` table
- ✅ Creates `site_settings` table (editable site config)
- ✅ Adds default subscription plans (Free, Premium Monthly, Premium Annual)
- ✅ Adds default site settings

---

### Step 5: Make Yourself Admin
**File:** `MAKE_ADMIN.sql`

After signing up in your app, make yourself an admin.

```sql
-- Replace 'your@email.com' with your actual email
-- Then run this in Supabase SQL Editor

INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'
FROM auth.users
WHERE email = 'your@email.com'
ON CONFLICT DO NOTHING;

-- Verify it worked
SELECT u.email, r.role
FROM auth.users u
JOIN public.user_roles r ON r.user_id = u.id
WHERE u.email = 'your@email.com';
```

**Alternative method (after signing in):**
```sql
SELECT public.assign_admin_role();
```

---

## ✅ Verification Checklist

After running all steps, verify your setup:

### Check Tables Exist
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;
```

**Expected tables:**
- alerts
- bookmarks
- categories
- countries
- encyclopaedia_entries
- library_items
- media_items
- notifications
- pages
- post_comments
- post_reactions
- post_revisions
- posts
- profiles
- search_queries
- sections
- site_settings
- subscription_plans
- user_activity
- user_preferences
- user_roles
- user_subscriptions

### Check Sample Data
```sql
SELECT 
  (SELECT COUNT(*) FROM posts) as posts,
  (SELECT COUNT(*) FROM media_items) as media,
  (SELECT COUNT(*) FROM library_items) as library,
  (SELECT COUNT(*) FROM encyclopaedia_entries) as encyclopaedia,
  (SELECT COUNT(*) FROM countries) as countries,
  (SELECT COUNT(*) FROM subscription_plans) as plans;
```

**Expected results:**
- posts: 10
- media: 6
- library: 6
- encyclopaedia: 6
- countries: 32
- plans: 3

### Check Storage Bucket
```sql
SELECT id, name, public, file_size_limit 
FROM storage.buckets 
WHERE id = 'content-files';
```

**Expected:**
- id: content-files
- name: content-files
- public: true
- file_size_limit: 52428800 (50MB)

### Check Your Admin Status
```sql
-- Replace with your email
SELECT u.email, r.role
FROM auth.users u
LEFT JOIN public.user_roles r ON r.user_id = u.id
WHERE u.email = 'your@email.com';
```

**Expected:**
- Should show both 'admin' and 'member' roles

---

## 🔧 Troubleshooting

### Error: "relation already exists"
**Cause:** You already ran that step.  
**Fix:** Skip to the next step, or run the nuclear clean version.

### Error: "column does not exist"
**Cause:** You skipped Step 1.  
**Fix:** Run `ALL_IN_ONE_COMPLETE.sql` first.

### Error: "trigger already exists"
**Cause:** Old triggers from previous setup.  
**Fix:** `ROLES_SETUP.sql` handles this - it drops all triggers first.

### Can't upload files
**Cause:** Storage bucket not created or policies missing.  
**Fix:** Run `STORAGE_SETUP.sql` again.

### Not seeing premium features
**Cause:** Premium tables not created.  
**Fix:** Run `PREMIUM_SUBSCRIPTIONS.sql`.

### Can't access admin features
**Cause:** Admin role not assigned.  
**Fix:** Run `MAKE_ADMIN.sql` with your email.

---

## 🎯 Quick Reference

| Step | File | Purpose | Time |
|------|------|---------|------|
| 1 | ALL_IN_ONE_COMPLETE.sql | Core schema & data | 15s |
| 2 | ROLES_SETUP.sql | Auth & roles | 5s |
| 3 | STORAGE_SETUP.sql | File uploads | 3s |
| 4 | PREMIUM_SUBSCRIPTIONS.sql | Premium features | 5s |
| 5 | MAKE_ADMIN.sql | Make yourself admin | 2s |

**Total time:** ~30 seconds

---

## 🚨 Nuclear Reset (Start Over)

If you want to completely wipe everything and start fresh:

```sql
-- ⚠️ WARNING: This deletes EVERYTHING!

-- Drop all tables
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;

-- Drop storage buckets
DELETE FROM storage.buckets WHERE id = 'content-files';

-- Then run all 5 steps again
```

---

## 📖 Additional Resources

- **ADMIN_TESTING_CHECKLIST.md** - How to test admin features
- **ADMIN_TROUBLESHOOTING.md** - Common admin issues
- **QUICK_REFERENCE.md** - SQL query examples
- **check-schema.sql** - Check your current schema

---

## ✨ Success!

After completing all steps, you should have:

- ✅ Complete database schema
- ✅ Sample content (posts, media, library)
- ✅ Authentication & roles working
- ✅ Storage bucket configured
- ✅ Premium features enabled
- ✅ Admin access granted
- ✅ Site settings configurable

**Your Preparedness for War is ready to use!** 🎉

---

**Last Updated:** April 24, 2026  
**Version:** 2.0 (Clean State)
