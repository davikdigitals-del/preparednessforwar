# Database Posts Now Live - Complete Fix

## What Was Wrong

The website was showing **mockData** (fake demo posts) instead of real posts from your database.

```typescript
// BEFORE (Wrong - using mockData)
const refreshPosts = useCallback(async () => {
  const { mockPosts } = await import("@/data/mockData");
  setPosts(mockPosts.map(p => ({...})));
}, []);
```

## What I Fixed

Now the website loads **real posts from your Supabase database**.

```typescript
// AFTER (Correct - using database)
const refreshPosts = useCallback(async () => {
  const { data } = await supabase
    .from("posts")
    .select("*")
    .eq("is_published", true)
    .order("published_at", { ascending: false });
  
  if (data) {
    setPosts(data.map((row) => mapPost(row)));
  }
}, []);
```

## How It Works Now

### 1. Create Post in Admin
```
1. Go to /admin/posts
2. Click "New Post"
3. Fill in:
   - Title
   - Author
   - Section
   - Category
   - Content
   - Image (optional)
   - Video (optional)
4. Check "Published"
5. Click "Create"
```

### 2. Post Appears Immediately
```
✅ Homepage shows new post
✅ Section page shows new post
✅ Category page shows new post
✅ Real-time updates (no refresh needed)
```

### 3. Edit Post
```
1. Edit post in admin
2. Click "Update"
✅ Changes appear immediately on website
```

### 4. Delete Post
```
1. Delete post in admin
✅ Post disappears from website immediately
```

## Database Fields Mapping

### Database → Website
```typescript
Database Field          → Website Display
─────────────────────────────────────────
title                   → Post title
content                 → Post body/content
excerpt                 → Post standfirst/summary
author                  → Author name
section                 → Section slug
category_id             → Category (linked)
image_url               → Post image
video_url               → Video player
is_premium              → Premium badge
is_published            → Show/hide post
country_codes           → Country filtering
published_at            → Publish date
view_count              → View counter
read_time               → Reading time
tags                    → Post tags
```

## Real-Time Updates

The system uses **Supabase Realtime** to automatically update when posts change:

```typescript
// Listens for database changes
supabase
  .channel("data-realtime")
  .on("postgres_changes", { 
    event: "*", 
    schema: "public", 
    table: "posts" 
  }, refreshPosts)
  .subscribe();
```

### What This Means:
- ✅ Create post → Appears immediately
- ✅ Edit post → Updates immediately
- ✅ Delete post → Disappears immediately
- ✅ No page refresh needed
- ✅ Multiple users see changes instantly

## Published vs Draft

### Published Posts (is_published = true)
```
✅ Appear on homepage
✅ Appear in section pages
✅ Appear in category pages
✅ Searchable
✅ Visible to all users
```

### Draft Posts (is_published = false)
```
❌ Hidden from homepage
❌ Hidden from section pages
❌ Hidden from category pages
❌ Not searchable
✅ Visible in admin panel only
```

## Post Display Logic

### Homepage
```typescript
// Shows latest published posts
const sortedPosts = publishedPosts
  .sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));

// Hero post (latest)
const heroPost = sortedPosts[0];

// Top stories (next 3)
const topStories = sortedPosts.slice(1, 4);

// Grid stories (next 12)
const gridStories = sortedPosts.slice(4, 16);
```

### Section Page
```typescript
// Shows posts for specific section
const posts = publishedPosts.filter(p => p.section === sectionSlug);
```

### Category Page
```typescript
// Shows posts for specific category
const posts = publishedPosts.filter(p => 
  p.section === sectionSlug && 
  p.category === categorySlug
);
```

## Example Workflow

### Scenario: Publishing Breaking News

**Step 1: Create Post**
```
Admin Panel:
- Title: "NATO Announces Emergency Meeting"
- Author: "Sarah Mitchell"
- Section: Emergency News
- Category: NATO Updates
- Content: "NATO leaders will meet tomorrow..."
- Image: Upload breaking-news.jpg
- Published: ✓ Checked
- Click "Create"
```

**Step 2: Post Goes Live**
```
✅ Homepage: Shows as hero post (latest)
✅ Emergency News section: Shows at top
✅ NATO Updates category: Shows at top
✅ Browser title: "NATO Announces Emergency Meeting | Preparedness For War"
✅ Real-time: All visitors see it immediately
```

**Step 3: Update Post**
```
Admin Panel:
- Edit post
- Add more details
- Click "Update"

✅ Changes appear immediately on website
✅ No cache clearing needed
✅ All visitors see updated content
```

## Testing Checklist

### Create Post Test
- [ ] Go to `/admin/posts`
- [ ] Click "New Post"
- [ ] Fill in all fields
- [ ] Check "Published"
- [ ] Click "Create"
- [ ] Go to homepage
- [ ] ✅ New post appears

### Edit Post Test
- [ ] Edit existing post in admin
- [ ] Change title
- [ ] Click "Update"
- [ ] Go to homepage
- [ ] ✅ Title updated

### Delete Post Test
- [ ] Delete post in admin
- [ ] Go to homepage
- [ ] ✅ Post disappeared

### Draft Post Test
- [ ] Create post
- [ ] Uncheck "Published"
- [ ] Click "Create"
- [ ] Go to homepage
- [ ] ✅ Post NOT visible
- [ ] Go to admin
- [ ] ✅ Post visible in admin

### Real-Time Test
- [ ] Open website in two browsers
- [ ] Create post in admin (browser 1)
- [ ] Check homepage (browser 2)
- [ ] ✅ Post appears without refresh

## Database Query

The system loads posts with this query:

```sql
SELECT * FROM posts
WHERE is_published = true
ORDER BY published_at DESC;
```

### What It Does:
1. Gets all posts from `posts` table
2. Filters only published posts
3. Orders by publish date (newest first)
4. Returns all fields

## Field Handling

### Required Fields
```
✓ title - Must have
✓ author - Must have
✓ section - Must have
✓ content - Must have
```

### Optional Fields
```
○ excerpt - Auto-generated from content if empty
○ image_url - Shows placeholder if empty
○ video_url - No video player if empty
○ category_id - Can be null
○ tags - Empty array if null
○ country_codes - Empty array if null
```

### Auto-Generated Fields
```
• id - UUID generated by database
• created_at - Timestamp when created
• updated_at - Timestamp when updated
• view_count - Starts at 0
• read_time - Defaults to "5 min"
```

## Files Modified

1. **src/contexts/DataContext.tsx**
   - Changed `refreshPosts()` to load from database
   - Fixed `mapPost()` to handle all database fields
   - Removed mockData import

## Before vs After

### Before (Using mockData)
```
❌ Shows 20 fake demo posts
❌ Creating posts in admin doesn't show on website
❌ Editing posts doesn't update website
❌ Deleting posts doesn't remove from website
❌ Posts never change
```

### After (Using Database)
```
✅ Shows real posts from database
✅ Creating posts appears immediately
✅ Editing posts updates immediately
✅ Deleting posts removes immediately
✅ Real-time updates
```

## Summary

### What Changed
- Posts now load from **Supabase database**
- Real-time updates enabled
- Create/edit/delete works instantly

### What You Can Do Now
1. ✅ Create posts in admin → Appear on website
2. ✅ Edit posts → Updates show immediately
3. ✅ Delete posts → Disappear from website
4. ✅ Publish/unpublish → Control visibility
5. ✅ Add images/videos → Display on website
6. ✅ Set premium → Show premium badge
7. ✅ Assign countries → Filter by country

### What Happens Automatically
- ✅ New posts appear on homepage
- ✅ Posts sorted by date (newest first)
- ✅ Section pages update
- ✅ Category pages update
- ✅ Search includes new posts
- ✅ View counts increment
- ✅ Real-time sync across all users

## Next Steps

1. **Create Your First Real Post**
   - Go to `/admin/posts`
   - Click "New Post"
   - Fill in details
   - Check "Published"
   - Click "Create"
   - ✅ See it on homepage!

2. **Remove Mock Data (Optional)**
   - mockData.ts still exists for navigation
   - Can keep it for sections/categories
   - Posts now come from database

3. **Add More Posts**
   - Create as many posts as you want
   - All will appear automatically
   - No code changes needed

Your website is now **fully connected to the database** and posts appear automatically when you create them! 🎉
