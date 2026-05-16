# 🚨 CRITICAL FIX: Posts Don't Load Unless Admin is Logged In

## The Problem

- ❌ Homepage shows no posts when not logged in
- ❌ Posts only appear when admin is logged in
- ❌ Regular visitors can't see any content
- ❌ Member dashboard shows "No posts found"

**Root Cause:** Row Level Security (RLS) policies in Supabase are blocking public access to posts.

---

## ⚡ Quick Fix (2 Minutes)

### Go to Supabase SQL Editor

https://supabase.com/dashboard/project/xfbmpjgcfohewejdzlfw/editor

### Run This SQL

```sql
-- Drop old policies
DROP POLICY IF EXISTS "Posts are viewable by everyone" ON posts;
DROP POLICY IF EXISTS "Published posts are viewable by everyone" ON posts;
DROP POLICY IF EXISTS "posts_select" ON posts;

-- Create new policy that allows public access
CREATE POLICY "posts_public_select"
  ON posts FOR SELECT
  USING (
    is_published = true 
    OR status = 'published'
    OR auth.uid() IN (SELECT id FROM profiles WHERE is_admin = true)
  );

-- Ensure RLS is enabled
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- Verify it worked
SELECT COUNT(*) as visible_posts FROM posts WHERE is_published = true;
```

### Test Immediately

1. Open your site in **incognito/private mode** (not logged in)
2. Go to homepage
3. Should see posts ✅

---

## 🔍 What This Does

### Before (Broken):
```sql
-- Old policy might be too restrictive or missing
-- Result: Only admins can see posts
```

### After (Fixed):
```sql
-- New policy allows:
-- ✅ Anyone can see published posts (is_published = true)
-- ✅ Anyone can see posts with status = 'published'
-- ✅ Admins can see all posts (including drafts)
```

---

## 📋 Complete Fix (All Tables)

If you want to fix all tables at once, run the complete file:

**File:** `database/FIX_PUBLIC_POST_ACCESS.sql`

This fixes public access for:
- ✅ Posts
- ✅ Alerts
- ✅ Media items
- ✅ Library items
- ✅ Encyclopaedia entries
- ✅ Banner settings

---

## 🧪 How to Test

### Test 1: Incognito Mode (Not Logged In)

1. Open browser in incognito/private mode
2. Go to: `https://your-app.onrender.com`
3. Should see posts on homepage ✅
4. Click on a section (e.g., "News")
5. Should see posts ✅
6. Click on an article
7. Should load article ✅

### Test 2: Regular Member (Logged In)

1. Login as regular member (not admin)
2. Go to homepage
3. Should see posts ✅
4. Go to `/dashboard`
5. Should see posts ✅

### Test 3: Admin (Logged In)

1. Login as admin
2. Should see all posts (including drafts) ✅
3. Go to `/admin/posts`
4. Should see all posts ✅

---

## 🚨 Troubleshooting

### Issue 1: Still No Posts After Running SQL

**Check if posts are published:**

```sql
-- Check post status
SELECT 
  id,
  title,
  is_published,
  status
FROM posts
LIMIT 10;
```

**If `is_published = false`, publish them:**

```sql
-- Publish all posts
UPDATE posts 
SET 
  is_published = true,
  status = 'published'
WHERE is_published = false OR status != 'published';
```

---

### Issue 2: "Column is_published does not exist"

**Add the column:**

```sql
-- Add is_published column
ALTER TABLE posts 
ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT false;

-- Publish existing posts
UPDATE posts SET is_published = true;
```

---

### Issue 3: RLS Policies Not Working

**Check if RLS is enabled:**

```sql
-- Check RLS status
SELECT 
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename = 'posts';
```

**If `rls_enabled = false`, enable it:**

```sql
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
```

---

### Issue 4: Posts Show for Admin But Not Public

**Check the policy:**

```sql
-- View current policies
SELECT 
  policyname,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'posts';
```

**Should see `posts_public_select` with `USING` clause that allows public access.**

If not, run the fix SQL again.

---

## 🔍 Verify Policies Are Correct

### Check All Policies on Posts Table

```sql
SELECT 
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'posts'
ORDER BY policyname;
```

### Expected Policies:

1. **posts_public_select** - SELECT - Public can read published posts
2. **posts_admin_insert** - INSERT - Admins can create posts
3. **posts_admin_update** - UPDATE - Admins can edit posts
4. **posts_admin_delete** - DELETE - Admins can delete posts

---

## 💡 Understanding RLS Policies

### What is RLS?

Row Level Security (RLS) controls who can see which rows in a table.

### How It Works:

```sql
CREATE POLICY "policy_name"
  ON table_name FOR SELECT
  USING (condition);
```

- **USING clause:** Determines which rows are visible
- **`true`:** Everyone can see all rows
- **`is_published = true`:** Only published rows are visible
- **`auth.uid() = user_id`:** Only your own rows are visible

### For Posts:

```sql
USING (
  is_published = true          -- Public can see published posts
  OR status = 'published'      -- Or posts with published status
  OR auth.uid() IN (...)       -- Or if you're an admin
)
```

This means:
- ✅ Anonymous users see published posts
- ✅ Logged-in members see published posts
- ✅ Admins see all posts (including drafts)

---

## ✅ Success Checklist

After running the SQL:

- [ ] Ran SQL to fix RLS policies
- [ ] Verified policies exist: `SELECT * FROM pg_policies WHERE tablename = 'posts'`
- [ ] Checked posts are published: `SELECT COUNT(*) FROM posts WHERE is_published = true`
- [ ] Tested in incognito mode (not logged in)
- [ ] Homepage shows posts ✅
- [ ] Section pages show posts ✅
- [ ] Article pages load ✅
- [ ] Member dashboard shows posts ✅
- [ ] Admin can still see all posts ✅

---

## 🎯 Quick Reference

### Make Posts Public:
```sql
DROP POLICY IF EXISTS "posts_select" ON posts;
CREATE POLICY "posts_public_select" ON posts FOR SELECT USING (is_published = true);
```

### Publish All Posts:
```sql
UPDATE posts SET is_published = true, status = 'published';
```

### Check Visible Posts:
```sql
SELECT COUNT(*) FROM posts WHERE is_published = true;
```

### List All Policies:
```sql
SELECT * FROM pg_policies WHERE tablename = 'posts';
```

---

## 📚 Related Files

- **`database/FIX_PUBLIC_POST_ACCESS.sql`** - Complete fix for all tables
- **`database/schema.sql`** - Full database schema with RLS policies
- **`database/COMPLETE_SETUP_SINGLE_FILE.sql`** - Complete database setup

---

## 🚀 After the Fix

Once you run the SQL:

**Before:**
- ❌ Posts only visible to admins
- ❌ Homepage empty for public
- ❌ Member dashboard empty

**After:**
- ✅ Posts visible to everyone
- ✅ Homepage shows posts
- ✅ Member dashboard shows posts
- ✅ Admins still see all posts (including drafts)

---

**Your website should now load posts for everyone! 🎉**

**Test it:** Open your site in incognito mode and verify posts are visible.
