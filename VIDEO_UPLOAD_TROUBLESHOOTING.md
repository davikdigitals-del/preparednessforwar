# Video Upload Troubleshooting - Quick Fix Guide

## Problem: Can't Add Videos in Admin Panel

### Quick Checklist

Run through these checks in order:

#### ✅ Step 1: Check You're Logged In as Admin
```javascript
// Open browser console (F12) and run:
const { data: { user } } = await supabase.auth.getUser();
console.log("User ID:", user?.id);

const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
console.log("Is Admin:", profile?.is_admin);
console.log("Role:", profile?.role);
```

**Expected:** `is_admin: true` and `role: "admin"`

**If not admin:** Go to `/admin-login` and create/login with admin account

---

#### ✅ Step 2: Check Storage Buckets Exist
```javascript
// In browser console:
const { data: buckets, error } = await supabase.storage.listBuckets();
console.log("Buckets:", buckets);
console.log("Error:", error);
```

**Expected:** You should see `post-images` and `post-videos` buckets

**If missing:** Run the SQL script `database/SETUP_VIDEO_STORAGE.sql` in Supabase SQL Editor

---

#### ✅ Step 3: Test Upload Permissions
```javascript
// In browser console:
// Create a tiny test file
const testFile = new File(['test'], 'test.txt', { type: 'text/plain' });

const { data, error } = await supabase.storage
  .from('post-videos')
  .upload('test-' + Date.now() + '.txt', testFile);

console.log("Upload result:", data);
console.log("Upload error:", error);
```

**Expected:** `data` should have file path, `error` should be null

**If error:** Check the error message:
- "Bucket not found" → Run SETUP_VIDEO_STORAGE.sql
- "Permission denied" → Check storage policies
- "File too large" → File size issue (shouldn't happen with test file)

---

#### ✅ Step 4: Check Video URL Field in Database
```javascript
// In browser console:
const { data, error } = await supabase
  .from('posts')
  .select('id, title, video_url')
  .limit(1);

console.log("Posts:", data);
console.log("Error:", error);
```

**Expected:** Query should work, `video_url` field should exist

**If error "column video_url does not exist":**
```sql
-- Run in Supabase SQL Editor:
ALTER TABLE posts ADD COLUMN IF NOT EXISTS video_url text;
```

---

#### ✅ Step 5: Check Browser Console for Errors

1. Open browser console (F12)
2. Go to Admin → Posts → New Post
3. Try to add a video
4. Look for red error messages

**Common errors:**

**"Bucket not found"**
```sql
-- Run in Supabase SQL Editor:
INSERT INTO storage.buckets (id, name, public)
VALUES ('post-videos', 'post-videos', true)
ON CONFLICT (id) DO NOTHING;
```

**"Permission denied for table objects"**
```sql
-- Run in Supabase SQL Editor:
CREATE POLICY "Allow authenticated video uploads" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'post-videos');

CREATE POLICY "Allow public video read" ON storage.objects
  FOR SELECT TO public
  USING (bucket_id = 'post-videos');
```

**"File too large"**
- Videos must be under 100MB
- Compress video before uploading
- Or use URL method instead

---

## Quick Fix: Use URL Method Instead

If file upload isn't working, you can always use the URL method:

1. Upload your video to YouTube, Vimeo, or any hosting service
2. Copy the video URL
3. In admin panel:
   - Go to "Post Video/Podcast" section
   - Click **"From URL"** tab
   - Paste the URL
   - Click **"Add"** button
4. Save the post

**This works with:**
- YouTube: `https://www.youtube.com/watch?v=VIDEO_ID`
- Vimeo: `https://vimeo.com/VIDEO_ID`
- Any direct video URL: `https://example.com/video.mp4`

---

## Complete Setup Script

If nothing works, run this complete setup in Supabase SQL Editor:

```sql
-- 1. Create buckets
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES 
  ('post-images', 'post-images', true, 5242880),
  ('post-videos', 'post-videos', true, 104857600)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit;

-- 2. Create policies
CREATE POLICY IF NOT EXISTS "Allow authenticated video uploads" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'post-videos');

CREATE POLICY IF NOT EXISTS "Allow public video read" ON storage.objects
  FOR SELECT TO public
  USING (bucket_id = 'post-videos');

CREATE POLICY IF NOT EXISTS "Allow authenticated video delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'post-videos');

-- 3. Add video_url column if missing
ALTER TABLE posts ADD COLUMN IF NOT EXISTS video_url text;

-- 4. Verify
SELECT * FROM storage.buckets WHERE name IN ('post-images', 'post-videos');
```

---

## Test Video Upload

After running the setup:

1. **Go to Admin Panel** → Posts → New Post
2. **Fill in required fields:**
   - Title: "Test Video"
   - Author: "Admin"
   - Section: "Podcast & Video"
   - Category: Select any
   - Content: "Test content"

3. **Add video using URL method:**
   - Scroll to "Post Video/Podcast"
   - Click "From URL" tab
   - Paste: `https://www.youtube.com/watch?v=dQw4w9WgXcQ`
   - Click "Add"
   - You should see "URL Added" message

4. **Save:**
   - Check "Published"
   - Click "Create"

5. **View on frontend:**
   - Go to the post page
   - Video should embed and play

---

## Still Not Working?

### Check These:

1. **Are you on the correct Supabase project?**
   - Check project URL in `.env` file
   - Verify `VITE_SUPABASE_URL` matches your project

2. **Is RLS enabled on storage.objects?**
   ```sql
   -- Check RLS status
   SELECT tablename, rowsecurity 
   FROM pg_tables 
   WHERE schemaname = 'storage' AND tablename = 'objects';
   ```

3. **Are there conflicting policies?**
   ```sql
   -- List all storage policies
   SELECT * FROM pg_policies WHERE tablename = 'objects';
   ```

4. **Try disabling RLS temporarily (TESTING ONLY):**
   ```sql
   ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY;
   -- Test upload
   -- Then re-enable:
   ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;
   ```

---

## Contact Support

If you've tried everything and it still doesn't work:

1. **Copy error messages** from browser console
2. **Check Supabase logs** in Supabase Dashboard → Logs
3. **Verify database schema** matches expected structure
4. **Check storage dashboard** in Supabase → Storage

---

## Summary

**Most common issues:**
1. ❌ Storage buckets don't exist → Run SETUP_VIDEO_STORAGE.sql
2. ❌ Not logged in as admin → Login at /admin-login
3. ❌ Missing storage policies → Run policy creation SQL
4. ❌ video_url column missing → Add column to posts table

**Quickest solution:**
Use the **"From URL"** method instead of file upload - paste YouTube/Vimeo URLs directly!
