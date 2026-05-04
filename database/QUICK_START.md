# 🚀 Database Quick Start

## ⚡ 3-Minute Setup

### 1️⃣ Open Supabase SQL Editor
Go to your Supabase project → SQL Editor

### 2️⃣ Run schema.sql
```
1. Open: database/schema.sql
2. Copy: ENTIRE file (Ctrl+A, Ctrl+C)
3. Paste: Into SQL Editor
4. Run: Click "Run" button or press F5
5. Wait: For "Success. No rows returned"
```

### 3️⃣ Run sample-data.sql
```
1. Click: "New Query" in SQL Editor
2. Open: database/sample-data.sql
3. Copy: ENTIRE file (Ctrl+A, Ctrl+C)
4. Paste: Into SQL Editor
5. Run: Click "Run" button or press F5
6. See: "Posts: 10, Media Items: 6, Library Items: 6"
```

### 4️⃣ Verify
```sql
SELECT COUNT(*) FROM posts;
```
Should return: **10**

## ✅ Done!

Your database now has:
- ✅ 10 sample posts
- ✅ 6 media items
- ✅ 6 library documents
- ✅ 6 encyclopaedia entries
- ✅ 3 alerts
- ✅ 32 countries
- ✅ 8 sections

## 🚨 Got Errors?

### "column section does not exist"
**Fix:** You skipped step 2. Run `schema.sql` first!

### "relation posts already exists"
**Fix:** You already ran `schema.sql`. Skip to step 3.

### "duplicate key value"
**Fix:** You already ran `sample-data.sql`. Delete data first:
```sql
DELETE FROM posts;
DELETE FROM media_items;
DELETE FROM library_items;
```
Then run `sample-data.sql` again.

## 📖 Need More Help?

Read: **`SETUP_INSTRUCTIONS.md`** for detailed guide

## 🎯 Order Matters!

```
✅ CORRECT:
   schema.sql → sample-data.sql → functions.sql

❌ WRONG:
   sample-data.sql → schema.sql
   (This causes "column does not exist" errors)
```

## 🔧 Optional: Advanced Features

After steps 1-3, optionally run:
```
4. Open: database/functions.sql
5. Copy: ENTIRE file
6. Paste: Into SQL Editor
7. Run: Click "Run"
```

This adds search, analytics, and recommendation functions.

## 📊 Check Your Data

```sql
-- See all posts
SELECT title, section, category FROM posts;

-- See posts by section
SELECT section, COUNT(*) FROM posts GROUP BY section;

-- See all media
SELECT title, type FROM media_items;

-- See all library items
SELECT title, category FROM library_items;
```

## 🎉 You're Ready!

Start using your Preparedness for War with real data!

---

**Time to complete:** 3 minutes  
**Difficulty:** Easy  
**Files needed:** schema.sql, sample-data.sql  
**Result:** Fully populated database
