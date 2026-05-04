# 🚀 Database Setup Instructions

## ⚠️ CRITICAL: Follow This Exact Order!

The errors you're seeing (`column "section" does not exist`, `column "standfirst" does not exist`) happen when you try to run `sample-data.sql` **BEFORE** running `schema.sql`.

## ✅ Correct Setup Order

### Step 1: Run schema.sql FIRST
This creates all the tables with the correct structure.

1. Open Supabase Dashboard
2. Go to **SQL Editor**
3. Click **New Query**
4. Copy and paste the **ENTIRE** contents of `schema.sql`
5. Click **Run** (or press F5)
6. Wait for "Success" message

### Step 2: Run sample-data.sql SECOND
This adds test data to the tables you just created.

1. In SQL Editor, click **New Query**
2. Copy and paste the **ENTIRE** contents of `sample-data.sql`
3. Click **Run**
4. You should see success messages with counts:
   - Posts: 10
   - Media Items: 6
   - Library Items: 6
   - Encyclopaedia Entries: 6

### Step 3: Verify Everything Works
```sql
-- Run this to check your data
SELECT COUNT(*) as post_count FROM posts;
SELECT COUNT(*) as media_count FROM media_items;
SELECT COUNT(*) as library_count FROM library_items;
```

## 🔧 If You Already Have Tables

If you already ran `sample-data.sql` first and got errors, you have two options:

### Option A: Drop and Recreate (Clean Start)
```sql
-- ⚠️ WARNING: This deletes ALL data in these tables!
DROP TABLE IF EXISTS posts CASCADE;
DROP TABLE IF EXISTS media_items CASCADE;
DROP TABLE IF EXISTS library_items CASCADE;
DROP TABLE IF EXISTS encyclopaedia_entries CASCADE;
DROP TABLE IF EXISTS alerts CASCADE;
DROP TABLE IF EXISTS banner_settings CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS bookmarks CASCADE;
DROP TABLE IF EXISTS post_comments CASCADE;
DROP TABLE IF EXISTS post_reactions CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- Now run schema.sql, then sample-data.sql
```

### Option B: Add Missing Columns (If tables exist but are incomplete)
```sql
-- Check if columns exist first
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'posts';

-- If 'section' or 'standfirst' are missing, add them:
ALTER TABLE posts ADD COLUMN IF NOT EXISTS section TEXT;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS standfirst TEXT;

-- Now you can run sample-data.sql
```

## 📋 What Each File Does

| File | Purpose | When to Run |
|------|---------|-------------|
| `schema.sql` | Creates all tables, indexes, functions, policies | **FIRST** - Always |
| `sample-data.sql` | Adds test data (posts, media, etc.) | **SECOND** - After schema.sql |
| `functions.sql` | Advanced database functions (optional) | **THIRD** - Optional |
| `migrations.sql` | Future updates to schema | **LATER** - When updating |
| `check-schema.sql` | Diagnostic tool to see your current structure | **ANYTIME** - For debugging |

## 🐛 Troubleshooting

### Error: "column X does not exist"
**Cause:** You ran `sample-data.sql` before `schema.sql`  
**Fix:** Run `schema.sql` first, then `sample-data.sql`

### Error: "relation posts already exists"
**Cause:** You're running `schema.sql` again  
**Fix:** Either drop the table first, or skip to `sample-data.sql`

### Error: "duplicate key value violates unique constraint"
**Cause:** You're running `sample-data.sql` multiple times  
**Fix:** Delete existing data first:
```sql
DELETE FROM posts;
DELETE FROM media_items;
DELETE FROM library_items;
-- Then run sample-data.sql again
```

### No errors but no data showing
**Check:** Run this to see what's in your database:
```sql
SELECT 
  (SELECT COUNT(*) FROM posts) as posts,
  (SELECT COUNT(*) FROM media_items) as media,
  (SELECT COUNT(*) FROM library_items) as library;
```

## 🎯 Quick Start (Copy-Paste This)

```sql
-- 1️⃣ FIRST: Create tables (paste entire schema.sql here)

-- 2️⃣ SECOND: Add sample data (paste entire sample-data.sql here)

-- 3️⃣ VERIFY: Check it worked
SELECT 
  (SELECT COUNT(*) FROM posts) as posts,
  (SELECT COUNT(*) FROM media_items) as media,
  (SELECT COUNT(*) FROM library_items) as library,
  (SELECT COUNT(*) FROM encyclopaedia_entries) as encyclopaedia;
```

## ✨ Expected Results

After running both files correctly, you should have:
- ✅ 10 sample posts with full content
- ✅ 6 media items (videos and podcasts)
- ✅ 6 library items (documents)
- ✅ 6 encyclopaedia entries
- ✅ 3 active alerts
- ✅ 1 banner setting
- ✅ All NATO countries in the countries table
- ✅ All sections (Emergency, Survival, Health, etc.)

## 📞 Still Having Issues?

Run `check-schema.sql` and share the output. It will show exactly what tables and columns you have, which helps diagnose the problem.
