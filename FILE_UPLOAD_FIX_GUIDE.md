# File Upload Fix Guide

## Problem
File uploads are failing across the admin portal (Posts, Media, Library, Podcast/Videos) because Supabase Storage buckets are not configured.

## Root Cause
The FileUpload component tries to upload files to these buckets:
- `post-images` - for images
- `post-videos` - for videos

These buckets don't exist yet in your Supabase project, so uploads fail.

---

## Solution: Set Up Storage Buckets

### Step 1: Open Supabase SQL Editor

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project: `preparednessforwar`
3. Click **"SQL Editor"** in the left sidebar
4. Click **"New Query"**

### Step 2: Run the Storage Setup Script

Copy and paste this entire script into the SQL Editor:

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

### Step 3: Click "Run"

You should see:
```
Success. No rows returned
```

And at the bottom, you should see 2 rows:
```
post-images | post-images | true
post-videos | post-videos | true
```

---

## Test File Upload

### Test 1: Upload an Image

1. Go to **Admin Portal → Posts → New Post**
2. Fill in required fields:
   - Title: "Test Upload"
   - Author: "Admin"
   - Section: Select any
   - Category: Select any
   - Content: "Testing file upload"
3. Scroll to **"Post Image"**
4. Click **"Upload File"** tab
5. Select a small image (< 5MB)
6. Wait for upload
7. You should see the image preview
8. Click **"Create"**

### Test 2: Use a URL (Easier Alternative)

If file upload still doesn't work, you can always use URLs:

1. Go to **Admin Portal → Posts → New Post**
2. Fill in required fields
3. Scroll to **"Post Image"**
4. Click **"From URL"** tab
5. Paste an image URL: `https://images.unsplash.com/photo-1506905925346-21bda4d32df4`
6. Click **"Add"**
7. You should see the image preview
8. Click **"Create"**

---

## Troubleshooting

### Issue: "Bucket not found" error

**Check if buckets exist:**
```sql
SELECT * FROM storage.buckets;
```

**If empty, create them manually:**
```sql
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('post-images', 'post-images', true),
  ('post-videos', 'post-videos', true);
```

### Issue: "Permission denied" error

**Option 1: Check if you're logged in**
- Open browser console (F12)
- Run: `const { data: { user } } = await supabase.auth.getUser(); console.log("User:", user);`
- If null, you're not logged in

**Option 2: Temporarily disable RLS (for testing only)**
```sql
ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY;
```

⚠️ **Warning:** This disables security. Only use for testing!

**Option 3: Use URL method instead**
- Don't upload files
- Just paste image/video URLs
- No storage needed!

### Issue: Upload works but file doesn't show

**Check browser console (F12) for errors:**
- Look for CORS errors
- Look for 404 errors
- Look for permission errors

**Check if file was uploaded:**
1. Go to Supabase Dashboard
2. Click **"Storage"** in left sidebar
3. Click **"post-images"** or **"post-videos"**
4. You should see uploaded files

---

## Alternative: Use External URLs

You don't need storage to work! You can use external URLs:

### For Images:
- Unsplash: `https://images.unsplash.com/photo-...`
- Imgur: `https://i.imgur.com/...`
- Your own CDN

### For Videos:
- YouTube: `https://www.youtube.com/watch?v=...`
- Vimeo: `https://vimeo.com/...`
- Direct links: `https://example.com/video.mp4`

This works immediately without any storage setup!

---

## Files Affected

File uploads are used in these admin pages:

1. **AdminPosts** (`src/pages/admin/AdminPosts.tsx`)
   - Post Image upload
   - Post Video upload

2. **AdminMedia** (`src/pages/admin/AdminMedia.tsx`)
   - Thumbnail upload

3. **AdminLibrary** (`src/pages/admin/AdminLibrary.tsx`)
   - Resource file upload
   - Cover image upload

4. **AdminPodcastVideos** (`src/pages/admin/AdminPodcastVideos.tsx`)
   - Thumbnail upload

All use the same `FileUpload` component (`src/components/FileUpload.tsx`).

---

## Summary

**Easiest solution:**
1. Run the SQL script above in Supabase SQL Editor
2. Test file upload in Admin → Posts
3. If still fails, use URL method instead

**URL method always works** and doesn't require any storage setup!

---

## Next Steps

After running the SQL script:
1. ✅ Test image upload in Admin → Posts
2. ✅ Test video URL in Admin → Posts
3. ✅ Test thumbnail upload in Admin → Media
4. ✅ Test file upload in Admin → Library

If any still fail, check browser console (F12) for specific error messages.
