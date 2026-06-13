# Video Features Testing Guide - MX Player Style Implementation

## ✅ What's Implemented

Your video player now works like **MX Player** with native browser Picture-in-Picture (PiP) and fullscreen features.

---

## 🎥 Features Overview

### 1. Picture-in-Picture (Floating Video)
**Like MX Player:** Video floats in a small window that stays on top while you browse

**Where it works:**
- ✅ Direct video files (.mp4, .webm, .ogg)
- ✅ Course videos uploaded to Supabase
- ✅ Post videos from storage
- ❌ YouTube/Vimeo embeds (browser limitation - iframes can't use PiP)

**How it works:**
- **ALL VIDEOS**: Manual PiP button (⧉ icon) in video controls
- **COURSE VIDEOS ONLY**: Auto-trigger when scrolling (video becomes <30% visible)

### 2. Fullscreen with Landscape Lock
**Like MX Player:** On mobile, fullscreen automatically rotates to landscape (horizontal)

**Features:**
- ✅ Fullscreen button in all video players
- ✅ Mobile: Auto-locks to landscape orientation
- ✅ Desktop: Regular fullscreen
- ✅ Auto-unlocks when exiting fullscreen

---

## 🧪 Testing Instructions

### Test 1: Manual Picture-in-Picture (All Videos)

**Steps:**
1. Navigate to any article with a video (e.g., `/emergency/natural-disasters/[post-id]`)
2. Play the video
3. Look at the video controls at the bottom
4. Find the PiP button: **⧉** icon (next to fullscreen button)
5. Click the PiP button

**Expected Result:**
- Video pops out into a floating window
- Floating window stays on top
- You can resize the window by dragging corners
- You can move it around the screen
- You can browse other pages while video plays
- Click PiP button again (or X on floating window) to return to normal

**Browsers that support PiP:**
- ✅ Chrome/Edge (Desktop & Android)
- ✅ Safari (Desktop & iOS 14+)
- ✅ Firefox (Desktop)
- ❌ IE11, older browsers

---

### Test 2: Auto Picture-in-Picture (Course Videos Only)

**Steps:**
1. Navigate to a course lesson page (e.g., `/courses/[course-id]/lessons/[lesson-id]`)
2. Play the course video
3. Scroll down the page slowly
4. Keep scrolling until video is mostly out of view

**Expected Result:**
- When video is <30% visible, it automatically enters PiP mode
- Video floats in a small window
- Continue scrolling - video stays floating
- Scroll back up - video returns to normal position
- This ONLY happens on course pages, not regular articles

**If it doesn't work:**
- Check if your browser supports PiP (see list above)
- Check browser console for errors
- Try a different browser

---

### Test 3: Fullscreen on Desktop

**Steps:**
1. Play any video
2. Click the fullscreen button: **⛶** icon (rightmost button in controls)
3. Press ESC or click minimize button to exit

**Expected Result:**
- Video fills entire screen
- Controls still work (play/pause, volume, etc.)
- Exit fullscreen returns to normal

---

### Test 4: Fullscreen on Mobile (Landscape Lock)

**Steps:**
1. **On your phone** (not desktop browser), navigate to any video
2. Make sure auto-rotate is ENABLED in your phone settings
3. Play the video
4. Tap the fullscreen button
5. Phone should auto-rotate to landscape (horizontal)
6. Exit fullscreen
7. Phone should return to portrait (or stay landscape based on your preference)

**Expected Result:**
- Entering fullscreen → locks to landscape
- Exiting fullscreen → unlocks orientation
- Better viewing experience (wider video on mobile)

**Supported Devices:**
- ✅ Android Chrome/Edge
- ✅ iOS Safari (iOS 16+)
- ⚠️ Some older devices may not support orientation lock

---

## 🚨 Troubleshooting

### PiP button is greyed out or disabled
**Cause:** Your browser doesn't support PiP for this video type
**Fix:** 
- Try Chrome or Edge (best support)
- Won't work on YouTube embeds (use native YouTube PiP instead)
- Won't work on audio-only files

### Auto-PiP doesn't trigger when scrolling
**Check:**
1. Are you on a **course lesson** page? (Only works for courses, not articles)
2. Is the video playing? (Must be playing, not paused)
3. Does your browser support PiP? (Check browser support list)
4. Open browser console (F12) - any errors?

### Landscape lock doesn't work on mobile
**Check:**
1. Is auto-rotate enabled on your phone?
2. Are you testing on actual mobile device (not desktop emulator)?
3. iOS: Need iOS 16+ and Safari browser
4. Android: Need Chrome 81+ or Edge

### Video exits PiP immediately
**Cause:** Browser might block auto-PiP without user interaction
**Fix:** 
- Click play button first, then scroll
- Some browsers require manual PiP activation

---

## 🎬 Video Player Controls Reference

Bottom controls (left to right):
1. **⏮ Skip Back 10s** - Rewind 10 seconds
2. **▶️ Play/Pause** - Toggle playback
3. **⏭ Skip Forward 10s** - Fast-forward 10 seconds
4. **Time Display** - Current time / Total duration
5. **🔊 Volume** - Volume slider
6. **⚙️ Speed** - Playback speed (0.5x to 2x)
7. **💾 Download** - Save to dashboard (free content only)
8. **⧉ Picture-in-Picture** - Float video
9. **⛶ Fullscreen** - Fullscreen mode

---

## 📊 Browser Support Matrix

| Feature | Chrome | Edge | Safari | Firefox | Opera |
|---------|--------|------|--------|---------|-------|
| Manual PiP | ✅ | ✅ | ✅ (14+) | ✅ | ✅ |
| Auto PiP | ✅ | ✅ | ✅ (16+) | ✅ | ✅ |
| Fullscreen | ✅ | ✅ | ✅ | ✅ | ✅ |
| Orientation Lock (Mobile) | ✅ | ✅ | ✅ (16+) | ❌ | ✅ |

---

## 💡 Tips for Best Experience

### For Users:
- Use Chrome or Edge for best PiP support
- Enable auto-rotate on mobile for landscape fullscreen
- PiP window can be moved by dragging
- PiP window can be resized by dragging corners (desktop)

### For Admins:
- Upload videos directly to Supabase storage (best compatibility)
- YouTube embeds won't support PiP (YouTube has its own PiP)
- Recommend direct video files for premium content
- Test on actual mobile devices, not just browser emulators

### For Developers:
- PiP events are logged to console (check F12)
- Intersection Observer threshold: 30% visibility
- Orientation lock requires HTTPS (security requirement)
- PiP requires user interaction (can't auto-trigger on page load)

---

## 🔍 Debug Mode

To see PiP system logs in browser console:

1. Open browser DevTools (F12)
2. Go to Console tab
3. Play a video and scroll
4. Look for these messages:
   - "PiP not available" - Browser doesn't support PiP
   - "PiP toggle error" - Something went wrong
   - "Orientation lock not supported" - Device doesn't support orientation API

---

## 📝 Feature Comparison: MX Player vs Your Implementation

| Feature | MX Player | Your Implementation | Status |
|---------|-----------|---------------------|--------|
| Floating video | ✅ | ✅ Native PiP | ✅ Same |
| Auto-float on scroll | ✅ | ✅ Course videos | ✅ Same |
| Manual PiP button | ✅ | ✅ All videos | ✅ Same |
| Landscape fullscreen | ✅ | ✅ Mobile only | ✅ Same |
| Resize floating window | ✅ | ✅ Native browser | ✅ Same |
| Custom controls in PiP | ✅ | ⚠️ Limited | Browser dependent |

**Note:** Browser PiP controls are limited compared to native apps. This is a web platform limitation, not an implementation issue.

---

## ✅ Final Checklist

Before marking as complete, verify:

- [ ] PiP button (⧉) appears in all video players
- [ ] Clicking PiP button floats the video
- [ ] Course videos auto-float when scrolling down
- [ ] Fullscreen button works on desktop
- [ ] Mobile fullscreen locks to landscape
- [ ] No console errors when using PiP
- [ ] PiP window can be moved/resized
- [ ] Exiting fullscreen unlocks orientation

---

## 🆘 Still Having Issues?

If features don't work after following this guide:

1. **Share browser info:**
   - Browser name and version
   - Device (desktop/mobile, OS)
   - Any console errors

2. **Share test results:**
   - Which tests passed?
   - Which tests failed?
   - Screenshot of video controls

3. **Check these:**
   - Is the video a direct file or embed?
   - Is HTTPS enabled? (Required for PiP)
   - Are you testing on actual device or emulator?
