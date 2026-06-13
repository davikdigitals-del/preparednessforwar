# How to Use Video Features (MX Player Style)

## ✅ ALREADY WORKING IN YOUR SITE

Both fullscreen and floating video features are **already implemented** and working!

---

## 🎬 Where to Find Them

### Look at the **bottom-right corner** of any video player:

```
Video Controls Bar:
┌─────────────────────────────────────────────────┐
│              [Video Playing]                    │
└─────────────────────────────────────────────────┘
[◀][▶][▶▶] 0:45/3:20 [🔊] [⚙️] [💾] [⧉] [⛶]
                                      ↑   ↑
                                      │   │
                              PiP ────┘   └──── Fullscreen
                           (Float)         (Full Screen)
```

---

## 🎪 Feature 1: Floating Video (Picture-in-Picture)

### Button Icon: **⧉** (PictureInPicture2)
**Location:** Second from the right in video controls

### What It Does:
- Pops video out into a small floating window
- Window stays on top of everything
- You can browse other pages while video plays
- **Exactly like MX Player's floating player**

### How to Use:
1. Play any video
2. Look at bottom-right controls
3. Click the **⧉** button
4. Video pops out into floating window
5. Move it by dragging
6. Resize by dragging corners (desktop)
7. Click **X** to close or click **⧉** again

### Auto-Float (Course Videos Only):
- Play a course video
- Scroll down the page
- When video is mostly hidden (30% visible)
- **Automatically floats** into PiP mode
- Like MX Player's auto-float feature

---

## 🖥️ Feature 2: Fullscreen

### Button Icon: **⛶** (Maximize) or **⊟** (Minimize when active)
**Location:** Far right in video controls

### What It Does:
- Makes video fill entire screen
- **Mobile:** Automatically rotates to landscape (horizontal)
- **Desktop:** Standard fullscreen
- **Like MX Player's fullscreen mode**

### How to Use:
1. Play any video
2. Look at bottom-right controls
3. Click the **⛶** (fullscreen) button
4. Video fills entire screen
5. **On mobile:** Screen auto-rotates to landscape
6. Press **ESC** or tap **⊟** to exit

---

## 🧪 Quick Test (30 seconds)

### Test 1: Floating Video
1. Go to `/courses` on your site
2. Click any course → Click a lesson
3. Play the video
4. Find **⧉** button (second from right)
5. Click it → Video should pop out
6. ✅ Working!

### Test 2: Fullscreen
1. On same video
2. Find **⛶** button (far right)
3. Click it → Video goes fullscreen
4. **Mobile:** Screen rotates to landscape
5. ✅ Working!

### Test 3: Auto-Float (Course Only)
1. Play course video
2. Scroll down the page
3. Video auto-floats when mostly hidden
4. ✅ Working!

---

## 📱 Mobile Landscape Lock

When you tap fullscreen on mobile:
- Screen **automatically rotates** to landscape (horizontal)
- Better viewing experience
- Auto-unlocks when you exit fullscreen
- **Requires auto-rotate enabled** in phone settings

---

## 🎯 Where These Features Work

### Works:
- ✅ Course videos
- ✅ Article videos
- ✅ Media hub videos
- ✅ Any direct video file (.mp4, .webm, etc.)

### Doesn't Work:
- ❌ YouTube embeds (use YouTube's native PiP instead)
- ❌ Vimeo embeds (browser limitation)
- ❌ Audio files (PiP is for video only)

---

## 🔍 Can't See the Buttons?

### If PiP button (⧉) is missing:
- Your browser doesn't support PiP
- Try Chrome or Edge (best support)
- Won't work on very old browsers

### If Fullscreen button (⛶) is missing:
- Should always be there
- Check if video is playing
- Hard refresh: Ctrl+Shift+R

### If buttons are there but greyed out:
- Video might not be loaded yet
- Wait for video to load
- Check browser console (F12) for errors

---

## 💡 Pro Tips

1. **Best Browser:** Chrome or Edge (best PiP support)
2. **Mobile:** Enable auto-rotate for landscape fullscreen
3. **PiP Window:** Drag to move, drag corners to resize
4. **Auto-Float:** Only works on course pages, not articles
5. **Keyboard:** Press **ESC** to exit fullscreen

---

## 🎨 How It Looks

### Normal Video:
```
┌─────────────────────────┐
│                         │
│   Video Playing Here    │
│                         │
└─────────────────────────┘
   [Controls at bottom]
```

### After Clicking PiP (⧉):
```
Your Page                    ┌──────┐
                             │Video │  ← Floating
Browse normally              │ plays│
while video floats  →        │ here │
                             └──────┘
```

### After Clicking Fullscreen (⛶):
```
┌─────────────────────────────────┐
│                                 │
│                                 │
│     Video Fills Full Screen     │
│                                 │
│                                 │
└─────────────────────────────────┘
     [Controls at bottom]
     [ESC to exit]
```

---

## ✅ Summary

Both features are **LIVE and WORKING**:

1. **⧉ Floating Video (PiP)**
   - Manual button in all videos
   - Auto-float on course videos when scrolling

2. **⛶ Fullscreen**
   - Button in all videos
   - Mobile: Auto-rotates to landscape

**Status:** Ready to use right now! ✅

Just play any video and look at the **bottom-right controls**!

---

## 📞 Still Need Help?

If you can't see or use the buttons:
1. Share a screenshot of your video player
2. Tell me which browser you're using
3. Check browser console (F12) for errors

The features are implemented and should be visible in all video players!
