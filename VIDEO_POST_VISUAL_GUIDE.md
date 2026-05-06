# Video Post Visual Guide

## How Video Posts Look

Video posts now appear just like normal posts but with special video indicators!

---

## 1. On Homepage / Category Pages (Grid View)

### Normal Post Card:
```
┌─────────────────────────────┐
│                             │
│      [Post Image]           │
│                             │
├─────────────────────────────┤
│ SECTION NAME                │
│                             │
│ Post Title Here             │
│                             │
│ Short description text...   │
│                             │
│ Author | 5 min               │
└─────────────────────────────┘
```

### Video Post Card:
```
┌─────────────────────────────┐
│         [VIDEO]  ←─────────┐│ Red "VIDEO" badge
│      [Post Image]          ││
│          ▶                 ││ Big play button
│       [Play Icon]          ││ (appears on hover)
│                            ││
├─────────────────────────────┤
│ SECTION NAME                │
│                             │
│ Post Title Here             │
│                             │
│ Short description text...   │
│                             │
│ Author | 5 min | ▶ Watch  ←─┘ "Watch" indicator
└─────────────────────────────┘
```

**Visual Features:**
- ✅ Red "VIDEO" badge in top-right corner
- ✅ Large blue play button (▶) in center
- ✅ Play button scales up on hover
- ✅ "Watch" text in bottom-right
- ✅ Semi-transparent overlay on image

---

## 2. Hero/Featured Video Post

```
┌───────────────────────────────────────────┐
│                [VIDEO]  ←─────────────────┤ Red badge
│                                           │
│              ▶                            │ Larger play button
│           [Play Icon]                     │
│                                           │
│                                           │
│  SECTION NAME                             │
│  Large Featured Title                     │
│  Description text here...                 │
│  Author | 5 min | ▶ Watch Video  ←───────┤ "Watch Video"
└───────────────────────────────────────────┘
```

---

## 3. On Article Detail Page

When you click a video post, you see:

```
┌─────────────────────────────────────────────┐
│ Home > Section > Category > Post Title      │ Breadcrumb
├─────────────────────────────────────────────┤
│                                             │
│ SECTION NAME                                │
│                                             │
│ Post Title Here                             │
│ Short description...                        │
│                                             │
│ Author | 5 min | Published Date | Views    │
│                                             │
├─────────────────────────────────────────────┤
│                                             │
│         [Hero Image if exists]              │
│                                             │
├─────────────────────────────────────────────┤
│                                             │
│  ┌───────────────────────────────────────┐ │
│  │                                       │ │
│  │     [VIDEO PLAYER EMBEDDED]          │ │ ← Video auto-embeds
│  │                                       │ │
│  │     YouTube / Vimeo / Direct         │ │
│  │                                       │ │
│  └───────────────────────────────────────┘ │
│                                             │
├─────────────────────────────────────────────┤
│                                             │
│  Article content text here...               │
│  Full article body...                       │
│                                             │
└─────────────────────────────────────────────┘
```

---

## 4. Supported Video Types

### YouTube Video
```
Admin adds: https://www.youtube.com/watch?v=VIDEO_ID
User sees:  [YouTube Player Embedded]
```

### Vimeo Video
```
Admin adds: https://vimeo.com/VIDEO_ID
User sees:  [Vimeo Player Embedded]
```

### Direct Video File
```
Admin adds: https://example.com/video.mp4
User sees:  [HTML5 Video Player]
```

### Podcast (Spotify)
```
Admin adds: https://open.spotify.com/episode/EPISODE_ID
User sees:  [Spotify Podcast Player]
            (smaller height, audio controls)
```

### Podcast (MP3 File)
```
Admin adds: https://example.com/podcast.mp3
User sees:  ┌─────────────────────────────┐
            │ 🎵 Podcast Audio            │
            │ Post Title                  │
            │ ▶ ━━━━━━━━━━━━━━━━━ 🔊    │ Audio player
            └─────────────────────────────┘
```

### Any Other Video URL
```
Admin adds: Any iframe-compatible URL
User sees:  [Generic Iframe Embed]
```

---

## 5. Color Scheme

**Video Indicators:**
- Play button background: Blue (#1e3a8a - blue-900)
- Play icon: White
- "VIDEO" badge: Red (#dc2626 - red-600)
- "Watch" text: Red (#dc2626 - red-600)
- Overlay: Black with 30% opacity

**On Hover:**
- Play button scales to 110%
- Overlay darkens to 40% opacity
- Image zooms slightly (105%)

---

## 6. Responsive Design

### Desktop (Large screens)
- Play button: 64px × 64px (w-16 h-16)
- Play icon: 32px (w-8 h-8)
- "VIDEO" badge: Visible
- Full card layout

### Mobile (Small screens)
- Play button: 48px × 48px (smaller)
- Play icon: 24px (smaller)
- "VIDEO" badge: Visible
- Stacked card layout

---

## 7. Example Scenarios

### Scenario 1: News Article with Video
```
Title: "UK Government Issues Emergency Alert"
Image: Government building
Video: YouTube news report
Result: 
  - Card shows government building
  - Red "VIDEO" badge visible
  - Play button overlay
  - Click → Article page with embedded video
```

### Scenario 2: Podcast Episode
```
Title: "Survival Skills Podcast: Episode 12"
Image: Podcast cover art
Video: Spotify podcast link
Result:
  - Card shows podcast cover
  - Red "VIDEO" badge (even though it's audio)
  - Play button overlay
  - Click → Article page with Spotify player
```

### Scenario 3: Tutorial Video
```
Title: "How to Build Emergency Water Supply"
Image: Water storage containers
Video: Direct MP4 file
Result:
  - Card shows water containers
  - Red "VIDEO" badge visible
  - Play button overlay
  - Click → Article page with HTML5 video player
```

---

## 8. User Experience Flow

1. **User browses homepage**
   - Sees mix of normal posts and video posts
   - Video posts have play button and "VIDEO" badge
   - Clearly distinguishable

2. **User hovers over video post**
   - Play button scales up
   - Overlay darkens slightly
   - "Watch" text visible

3. **User clicks video post**
   - Navigates to article page
   - Video player appears below title/image
   - Can read article and watch video

4. **User plays video**
   - Video plays inline
   - Full screen option available
   - Can pause/resume

---

## 9. Admin Experience

### Creating Video Post:
1. Go to Admin → Posts → New Post
2. Fill in normal fields (Title, Author, Content, etc.)
3. Add image (optional but recommended)
4. Scroll to "Post Video/Podcast"
5. Either:
   - Upload video file, OR
   - Paste video URL
6. Save post

### Result:
- Post appears in normal post list
- Automatically shows video indicators
- No extra configuration needed

---

## 10. Technical Details

**PostCard Component:**
- Checks for `videoUrl` or `video_url` field
- If exists, adds video indicators
- Works with all card variants (default, hero, compact, horizontal)

**ArticleVideoPlayer Component:**
- Auto-detects video type from URL
- Embeds appropriate player
- Handles YouTube, Vimeo, Spotify, direct files, etc.

**Styling:**
- Uses Tailwind CSS classes
- Responsive design
- Smooth transitions and hover effects

---

## Summary

**Video posts look like normal posts with these additions:**
- 🎬 Red "VIDEO" badge in corner
- ▶️ Blue play button in center
- 👁️ "Watch" indicator in footer
- 🎨 Semi-transparent overlay
- ✨ Hover effects

**They appear everywhere normal posts do:**
- Homepage grid
- Category pages
- Search results
- Related posts
- Featured sections

**When clicked:**
- Opens article page
- Video auto-embeds below title
- User can read and watch
- Full screen available
