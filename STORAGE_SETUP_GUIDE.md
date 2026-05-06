# Storage Setup Guide - Step by Step

## The Error You Got

```
ERROR: 42P01: relation "storage.policies" does not exist
```

This means your Supabase version doesn't have the `storage.policies` view. That's okay - we can work around it!

---

## Solution: Use the Simple Setup Script

### Step 1: Open Supabase SQL Editor

1. Go to your Supabase Dashboard
2. Click **"SQL Editor"** in the left sidebar
3. Click **"New Query"**

### Step 2: Run the Simple Setup Script

Copy and paste this entire script:

```sql
-- Create post-images bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('post-images', 'post-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Create post-videos bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('post-videos', 'post-videos', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Drop existing policies (to avoid conflicts)
DROP POLICY IF EXISTS "Allow authenticated image uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow public image read" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated image update" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated image delete" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated video uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow public video read" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated video update" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated video delete" ON storage.objects;

-- IMAGE POLICIES
CREATE POLICY "Allow authenticated image uploads" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'post-images');

CREATE POLICY "Allow public image read" ON storage.objects
  FOR SELECT TO public
  USING (bucket_id = 'post-images');

CREATE POLICY "Allow authenticated image update" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'post-images');

CREATE POLICY "Allow authenticated image delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'post-images');

-- VIDEO POLICIES
CREATE POLICY "Allow authenticated video uploads" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'post-videos');

CREATE POLICY "Allow public video read" ON storage.objects
  FOR SELECT TO public
  USING (bucket_id = 'post-videos');

CREATE POLICY "Allow authenticated video update" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'post-videos');

CREATE POLICY "Allow authenticated video delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'post-videos');

-- Verify
SELECT id, name, public FROM storage.buckets WHERE name IN ('post-images', 'post-videos');
```

### Step 3: Click "Run" Button

You should see:
```
Success. No rows returned
```

And at the bottom, you should see 2 rows showing your buckets:
```
post-images | true
post-videos | true
```

---

## Alternative: Minimal Setup (If Above Fails)

If the above script fails with policy errors, use this minimal version:

```sql
-- Create buckets
INSERT INTO storage.buckets (id, name, public)
VALUES ('post-images', 'post-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

INSERT INTO storage.buckets (id, name, public)
VALUES ('post-videos', 'post-videos', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Disable RLS temporarily (for testing)
ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY;

-- Verify
SELECT id, name, public FROM storage.buckets WHERE name IN ('post-images', 'post-videos');
```

⚠️ **Warning:** This disables security on storage. Only use for testing!

---

## Step 4: Test Video Upload

### Method A: Upload a File

1. Go to Admin Panel → Posts → New Post
2. Fill in required fields
3. Scroll to "Post Video/Podcast"
4. Click "Upload File" tab
5. Select a small video (<10MB for testing)
6. Wait for upload
7. Save post

### Method B: Use a URL (Easier!)

1. Go to Admin Panel → Posts → New Post
2. Fill in required fields:
   - Title: "Test Video"
   - Author: "Admin"
   - Section: "Podcast & Video"
   - Category: Select any
   - Content: "Test content"
3. Scroll to "Post Video/Podcast"
4. Click **"From URL"** tab
5. Paste: `https://www.youtube.com/watch?v=dQw4w9WgXcQ`
6. Click **"Add"** button
7. Check "Published"
8. Click "Create"

### Step 5: View the Post

1. Go to your site homepage
2. Find the post
3. Click to view
4. Video should embed and play

---

## Troubleshooting

### Issue: "Bucket not found" error

**Check if buckets exist:**
```sql
SELECT * FROM storage.buckets;
```

**If empty, create them:**
```sql
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('post-images', 'post-images', true),
  ('post-videos', 'post-videos', true);
```

### Issue: "Permission denied" error

**Option 1: Check if you're logged in**
```javascript
// In browser console (F12):
const { data: { user } } = await supabase.auth.getUser();
console.log("User:", user);
```

**Option 2: Temporarily disable RLS**
```sql
ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY;
```

**Option 3: Use URL method instead**
- Don't upload files
- Just paste YouTube/Vimeo URLs
- No storage needed!

### Issue: Upload works but video doesn't show

**Check if video_url is saved:**
```sql
SELECT id, title, video_url FROM posts WHERE video_url IS NOT NULL;
```

**If column doesn't exist:**
```sql
ALTER TABLE posts ADD COLUMN IF NOT EXISTS video_url text;
```

---

## Quick Test Without Storage

You don't actually need storage to work! You can use external URLs:

1. **Go to Admin → Posts → New Post**
2. **Fill in fields**
3. **Use "From URL" tab**
4. **Paste any of these:**
   - YouTube: `https://www.youtube.com/watch?v=dQw4w9WgXcQ`
   - Vimeo: `https://vimeo.com/148751763`
   - Direct: `https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4`
5. **Click "Add"**
6. **Save post**
7. **View on frontend**

This works immediately without any storage setup!

---

## Files Available

1. **`database/SIMPLE_STORAGE_SETUP.sql`** - Full setup with policies
2. **`database/MINIMAL_STORAGE_SETUP.sql`** - Minimal setup without policies
3. **`database/SETUP_VIDEO_STORAGE.sql`** - Original (has the error you saw)

Use **SIMPLE_STORAGE_SETUP.sql** first. If that fails, use **MINIMAL_STORAGE_SETUP.sql**.

---

## Summary

**Easiest solution:**
1. Run the simple setup script above
2. Or just use YouTube URLs (no storage needed!)
3. Test with: `https://www.youtube.com/watch?v=dQw4w9WgXcQ`

**If you want file uploads:**
1. Run `SIMPLE_STORAGE_SETUP.sql`
2. If that fails, run `MINIMAL_STORAGE_SETUP.sql`
3. Test with a small video file

**The URL method always works** and doesn't require any storage setup!
