# Quick Reference - Video Posts

## 🎬 How to Add Video to Post (2 Methods)

### Method 1: Upload File
```
Admin → Posts → New Post
↓
Fill: Title, Author, Section, Category, Content
↓
Scroll to "Post Video/Podcast"
↓
Click "Upload File" tab
↓
Select video file (MP4, WEBM, OGG, <100MB)
↓
Wait for upload
↓
Click "Create"
```

### Method 2: Paste URL (Recommended)
```
Admin → Posts → New Post
↓
Fill: Title, Author, Section, Category, Content
↓
Scroll to "Post Video/Podcast"
↓
Click "From URL" tab
↓
Paste video URL (YouTube, Vimeo, etc.)
↓
Click "Add" button
↓
Click "Create"
```

## 📋 Required Fields

- ✅ Title
- ✅ Author
- ✅ Section (dropdown)
- ✅ Category (dropdown)
- ✅ Content
- ⭐ Video URL (optional)
- ⭐ Countries (optional)
- ⭐ Premium checkbox (optional)
- ✅ Published checkbox

## 🔗 Supported Video URLs

| Platform | Example URL |
|----------|-------------|
| YouTube | `https://www.youtube.com/watch?v=VIDEO_ID` |
| YouTube Shorts | `https://youtube.com/shorts/VIDEO_ID` |
| Vimeo | `https://vimeo.com/VIDEO_ID` |
| Direct MP4 | `https://example.com/video.mp4` |
| Any iframe | Any embeddable video URL |

## 🐛 Quick Fixes

### Video upload fails?
```sql
-- Run in Supabase SQL Editor:
INSERT INTO storage.buckets (id, name, public)
VALUES ('post-videos', 'post-videos', true)
ON CONFLICT (id) DO NOTHING;
```

### Can't login as admin?
```sql
-- Run in Supabase SQL Editor:
UPDATE profiles 
SET is_admin = true, role = 'admin' 
WHERE email = 'your@email.com';
```

### Posts not loading?
```javascript
// Check in browser console (F12):
const { data, error } = await supabase.from('posts').select('*').limit(1);
console.log('Posts:', data, 'Error:', error);
```

## 🎯 Test Video URL

Use this to test if video posts work:
```
https://www.youtube.com/watch?v=dQw4w9WgXcQ
```

## 📁 Key Files

- Admin Posts: `src/pages/admin/AdminPosts.tsx`
- Video Player: `src/components/ArticleVideoPlayer.tsx`
- File Upload: `src/components/FileUpload.tsx`
- Storage Setup: `database/SETUP_VIDEO_STORAGE.sql`

## 🚨 Common Mistakes

❌ Forgetting to click "Add" after pasting URL
❌ Not filling required fields (Title, Author, Content)
❌ Uploading files over 100MB
❌ Not checking "Published" checkbox
❌ Using unsupported video formats (AVI, MOV)

✅ Paste URL → Click "Add" → See confirmation
✅ Fill all required fields
✅ Keep videos under 100MB
✅ Check "Published" to make live
✅ Use MP4, WEBM, or OGG formats

## 💡 Pro Tips

1. **Use YouTube URLs** - Easiest and most reliable
2. **Test with small videos** - Start with <10MB files
3. **Check console logs** - Press F12 to see errors
4. **Use "From URL" tab** - Faster than file upload
5. **Mark as premium** - Only for exclusive content

## 📞 Need Help?

1. Check `HOW_VIDEO_POSTS_WORK.md` - Complete guide
2. Check `VIDEO_UPLOAD_TROUBLESHOOTING.md` - Quick fixes
3. Check browser console (F12) - See error messages
4. Check Supabase logs - In Supabase dashboard
5. Run `SETUP_VIDEO_STORAGE.sql` - Fix storage issues
