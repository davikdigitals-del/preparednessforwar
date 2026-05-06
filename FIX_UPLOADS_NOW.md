# Fix File Uploads - Do This Now

## The Problem
File uploads don't work because Supabase Storage is not set up.

## The Solution (5 minutes)

### Step 1: Open Supabase
1. Go to: https://supabase.com/dashboard
2. Login
3. Select your project: **preparednessforwar**

### Step 2: Open SQL Editor
1. Click **"SQL Editor"** in the left sidebar
2. Click **"New Query"** button

### Step 3: Copy and Run This Script

Open the file: **`RUN_THIS_IN_SUPABASE.sql`**

Copy ALL the text and paste it into the SQL Editor, then click **"Run"**

### Step 4: Check It Worked

At the bottom of the SQL Editor, you should see:

```
post-images | post-images | true
post-videos | post-videos | true
```

If you see this, it worked! ✅

### Step 5: Test Upload

1. Go to your admin portal: http://localhost:5173/admin
2. Click **Posts** → **New Post**
3. Fill in:
   - Title: "Test Upload"
   - Author: "Admin"
   - Section: Any
   - Category: Any
   - Content: "Testing"
4. Scroll to **"Post Image"**
5. Click **"Upload File"** tab
6. Select a small image
7. Wait for upload
8. You should see the image preview ✅

---

## Alternative: Use URLs (No Setup Needed)

If you don't want to set up storage, you can use URLs instead:

### For Images:
1. Go to **Posts** → **New Post**
2. Click **"From URL"** tab
3. Paste: `https://images.unsplash.com/photo-1506905925346-21bda4d32df4`
4. Click **"Add"**
5. Done! ✅

### For Videos:
1. Go to **Posts** → **New Post**
2. Scroll to **"Post Video/Podcast"**
3. Click **"From URL"** tab
4. Paste: `https://www.youtube.com/watch?v=dQw4w9WgXcQ`
5. Click **"Add"**
6. Done! ✅

---

## What If It Still Doesn't Work?

### Check Browser Console
1. Press **F12** to open developer tools
2. Click **Console** tab
3. Try uploading again
4. Look for red error messages
5. Send me the error message

### Common Errors

**"Bucket not found"**
- You didn't run the SQL script
- Run `RUN_THIS_IN_SUPABASE.sql` again

**"Permission denied"**
- You're not logged in
- Go to admin portal and login again

**"File too large"**
- Images must be under 5MB
- Videos must be under 100MB
- Use URL method for larger files

---

## Summary

**Quick Fix:** Run `RUN_THIS_IN_SUPABASE.sql` in Supabase SQL Editor

**Alternative:** Use "From URL" tab instead of uploading files

**Test:** Try uploading an image in Admin → Posts

That's it! 🚀
