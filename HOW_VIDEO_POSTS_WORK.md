# How Video Posts Work - Complete Guide

## Overview

Video posts in the admin panel support **TWO methods**:
1. **Upload video files** directly to Supabase Storage
2. **Paste video URLs** from YouTube, Vimeo, or any video platform

## Step-by-Step: Adding Videos to Posts

### Method 1: Upload Video File

1. **Go to Admin Panel**
   - Navigate to `/admin`
   - Click "Posts" in the sidebar

2. **Create or Edit Post**
   - Click "New Post" button (or edit existing post)
   - Fill in required fields:
     - Title (required)
     - Author (required)
     - Section (select from dropdown)
     - Category (select from dropdown)
     - Content (required)

3. **Upload Video**
   - Scroll to "Post Video/Podcast (Optional)" section
   - You'll see two tabs: **"Upload File"** and **"From URL"**
   - Click **"Upload File"** tab
   - Click the upload area or drag & drop
   - Select your video file:
     - Supported formats: MP4, WEBM, OGG
     - Maximum size: 100MB
   - Wait for upload to complete
   - You'll see "Upload Successful" message

4. **Save Post**
   - Check "Published" if you want it live
   - Check "⭐ Premium Content" if it's premium-only
   - Click "Create" or "Update"

### Method 2: Paste Video URL

1. **Go to Admin Panel**
   - Navigate to `/admin`
   - Click "Posts" in the sidebar

2. **Create or Edit Post**
   - Click "New Post" button
   - Fill in required fields (Title, Author, Section, Category, Content)

3. **Add Video URL**
   - Scroll to "Post Video/Podcast (Optional)" section
   - Click **"From URL"** tab
   - Paste your video URL in the input field

   **Supported URLs:**
   - YouTube: `https://www.youtube.com/watch?v=VIDEO_ID`
   - YouTube Shorts: `https://youtube.com/shorts/VIDEO_ID`
   - Vimeo: `https://vimeo.com/VIDEO_ID`
   - Dailymotion: `https://www.dailymotion.com/video/VIDEO_ID`
   - Twitch VOD: `https://www.twitch.tv/videos/VIDEO_ID`
   - Direct video file: `https://example.com/video.mp4`
   - Any iframe-compatible video URL

4. **Click "Add" Button**
   - You'll see "URL Added" message
   - The URL is now saved

5. **Save Post**
   - Check "Published" if you want it live
   - Check "⭐ Premium Content" if it's premium-only
   - Click "Create" or "Update"

## How Videos Display on Frontend

When a user views the post:

1. **Article Page Loads**
   - Post content displays
   - If `video_url` exists, video player appears

2. **Video Player Auto-Detects URL Type**
   - **YouTube**: Embeds YouTube player
   - **Vimeo**: Embeds Vimeo player
   - **Direct file**: Shows HTML5 video player
   - **Other URLs**: Embeds in iframe

3. **Video Features**
   - Full screen support
   - Responsive design (16:9 aspect ratio)
   - Autoplay controls
   - Mobile-friendly

## Example URLs That Work

### YouTube
```
https://www.youtube.com/watch?v=dQw4w9WgXcQ
https://youtu.be/dQw4w9WgXcQ
https://youtube.com/shorts/dQw4w9WgXcQ
```

### Vimeo
```
https://vimeo.com/123456789
https://player.vimeo.com/video/123456789
```

### Direct Video Files
```
https://example.com/videos/my-video.mp4
https://storage.example.com/video.webm
```

### Podcast URLs
```
https://anchor.fm/podcast-name/episodes/episode-name
https://open.spotify.com/episode/EPISODE_ID
https://podcasts.apple.com/podcast/id123456789
```

## Troubleshooting

### Issue 1: "Upload Failed" Error

**Possible Causes:**
1. Storage bucket doesn't exist
2. File too large (>100MB)
3. Wrong file format
4. No storage permissions

**Solutions:**

**A. Check if storage bucket exists:**
```sql
-- In Supabase SQL Editor
SELECT * FROM storage.buckets WHERE name = 'post-videos';
```

**B. Create storage bucket if missing:**
```sql
-- Create bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('post-videos', 'post-videos', true);
```

**C. Set storage policies:**
```sql
-- Allow authenticated users to upload
CREATE POLICY "Allow authenticated uploads" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'post-videos');

-- Allow public read access
CREATE POLICY "Allow public read" ON storage.objects
  FOR SELECT TO public
  USING (bucket_id = 'post-videos');

-- Allow authenticated users to delete their uploads
CREATE POLICY "Allow authenticated delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'post-videos');
```

**D. Check file size:**
- Videos must be under 100MB
- Compress large videos before uploading
- Use online tools like HandBrake or CloudConvert

**E. Check file format:**
- Supported: MP4, WEBM, OGG
- Not supported: AVI, MOV, MKV (convert first)

### Issue 2: Video URL Not Saving

**Possible Causes:**
1. Forgot to click "Add" button
2. Invalid URL format
3. Database field missing

**Solutions:**

**A. Make sure to click "Add" button:**
- After pasting URL, click the "Add" button
- You should see "URL Added" toast message

**B. Check URL format:**
- Must start with `http://` or `https://`
- No spaces or special characters
- Test URL in browser first

**C. Check database field:**
```sql
-- Check if video_url column exists
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'posts' 
AND column_name = 'video_url';

-- Add column if missing
ALTER TABLE posts ADD COLUMN IF NOT EXISTS video_url text;
```

### Issue 3: Video Not Showing on Article Page

**Possible Causes:**
1. Post not published
2. Video URL empty
3. ArticleVideoPlayer component not imported

**Solutions:**

**A. Check post is published:**
- In admin panel, verify "Published" is checked
- Check `is_published` field in database

**B. Check video URL exists:**
```sql
SELECT id, title, video_url 
FROM posts 
WHERE id = 'YOUR_POST_ID';
```

**C. Verify ArticleVideoPlayer is imported:**
The `ArticlePage.tsx` should have:
```typescript
import { ArticleVideoPlayer } from "@/components/ArticleVideoPlayer";

// In the component:
{post.video_url && <ArticleVideoPlayer url={post.video_url} title={post.title} />}
```

### Issue 4: "Permission Denied" Error

**Possible Causes:**
1. Not logged in as admin
2. RLS policies blocking access
3. Storage permissions not set

**Solutions:**

**A. Verify admin access:**
```javascript
// In browser console
const { data: { user } } = await supabase.auth.getUser();
const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
console.log('Is admin:', profile.is_admin);
```

**B. Check RLS policies:**
```sql
-- List all policies on posts table
SELECT * FROM pg_policies WHERE tablename = 'posts';

-- Temporarily disable RLS for testing
ALTER TABLE posts DISABLE ROW LEVEL SECURITY;
```

**C. Check storage permissions:**
```sql
-- List storage policies
SELECT * FROM storage.policies WHERE bucket_id = 'post-videos';
```

## Database Schema

### Posts Table
```sql
CREATE TABLE posts (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  title text NOT NULL,
  content text NOT NULL,
  excerpt text,
  author text NOT NULL,
  section text,
  category_id uuid REFERENCES categories(id),
  image_url text,
  video_url text,              -- ← Video URL field
  is_premium boolean DEFAULT false,
  is_published boolean DEFAULT true,
  country_codes text[],
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  view_count integer DEFAULT 0,
  read_time text DEFAULT '5 min'
);

-- Index for faster queries
CREATE INDEX idx_posts_video_url ON posts(video_url) WHERE video_url IS NOT NULL;
```

### Storage Buckets
```sql
-- post-videos bucket for uploaded videos
INSERT INTO storage.buckets (id, name, public)
VALUES ('post-videos', 'post-videos', true)
ON CONFLICT (id) DO NOTHING;

-- post-images bucket for uploaded images
INSERT INTO storage.buckets (id, name, public)
VALUES ('post-images', 'post-images', true)
ON CONFLICT (id) DO NOTHING;
```

## Video Player Component

The `ArticleVideoPlayer` component automatically detects and handles different video types:

```typescript
// YouTube detection
if (url.includes('youtube.com') || url.includes('youtu.be')) {
  // Extract video ID and embed YouTube player
}

// Vimeo detection
if (url.includes('vimeo.com')) {
  // Extract video ID and embed Vimeo player
}

// Direct video file
if (url.endsWith('.mp4') || url.endsWith('.webm')) {
  // Use HTML5 video player
}

// Generic iframe
else {
  // Embed in iframe
}
```

## Testing Checklist

- [ ] Can access admin panel
- [ ] Can create new post
- [ ] Can upload video file (<100MB)
- [ ] Can paste YouTube URL
- [ ] Can paste Vimeo URL
- [ ] Can paste direct video URL
- [ ] Video URL saves correctly
- [ ] Post appears in posts list
- [ ] Can view post on frontend
- [ ] Video player displays correctly
- [ ] Video plays without errors
- [ ] Premium posts show paywall for free users

## Quick Test

1. **Create Test Post:**
   ```
   Title: Test Video Post
   Author: Admin
   Section: Podcast & Video
   Category: Videos
   Content: This is a test video post
   Video URL: https://www.youtube.com/watch?v=dQw4w9WgXcQ
   ```

2. **Save and View:**
   - Click "Create"
   - Go to frontend
   - Navigate to the post
   - Video should embed and play

## Common Mistakes

❌ **Forgetting to click "Add" button** after pasting URL
✅ Paste URL → Click "Add" → See confirmation

❌ **Not filling required fields** (Title, Author, Content)
✅ Fill all required fields before saving

❌ **Uploading files over 100MB**
✅ Compress videos before uploading

❌ **Using unsupported video formats** (AVI, MOV)
✅ Convert to MP4, WEBM, or OGG first

❌ **Not checking "Published"** checkbox
✅ Check "Published" to make post visible

## Support for Different Video Types

| Type | Supported | Example |
|------|-----------|---------|
| YouTube | ✅ Yes | `youtube.com/watch?v=ID` |
| YouTube Shorts | ✅ Yes | `youtube.com/shorts/ID` |
| Vimeo | ✅ Yes | `vimeo.com/ID` |
| Dailymotion | ✅ Yes | `dailymotion.com/video/ID` |
| Twitch VOD | ✅ Yes | `twitch.tv/videos/ID` |
| MP4 File | ✅ Yes | `example.com/video.mp4` |
| WEBM File | ✅ Yes | `example.com/video.webm` |
| OGG File | ✅ Yes | `example.com/video.ogg` |
| Spotify Podcast | ✅ Yes | Any iframe-compatible URL |
| Apple Podcast | ✅ Yes | Any iframe-compatible URL |
| Generic Embed | ✅ Yes | Any iframe-compatible URL |

---

## Summary

**To add a video to a post:**
1. Go to Admin → Posts → New Post
2. Fill in Title, Author, Section, Category, Content
3. Scroll to "Post Video/Podcast"
4. Either:
   - Upload a video file (MP4, WEBM, OGG, <100MB), OR
   - Paste a video URL and click "Add"
5. Check "Published"
6. Click "Create"
7. View post on frontend - video will auto-embed

**If it's not working:**
- Check browser console for errors
- Verify storage buckets exist
- Check RLS policies
- Ensure you're logged in as admin
- Make sure video URL is valid

Need help? Check the console logs and error messages for specific issues.
