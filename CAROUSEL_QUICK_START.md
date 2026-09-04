# 📸 Image Carousel - Quick Start Guide

## 🎯 What You Can Do Now

Add beautiful **image galleries** to your articles with automatic slideshow, navigation controls, and thumbnails!

---

## 🚀 Step-by-Step Guide

### 1️⃣ **Go to Admin Posts**
```
Navigate to: Admin Portal → Posts → Create New Post (or Edit existing)
```

### 2️⃣ **Write Your Article**
- Add title, standfirst, and some content
- Position cursor where you want the carousel

### 3️⃣ **Click "Add Image Carousel" Button**
```
Location: Above the rich text editor
Button: [📷 Add Image Carousel]
```

### 4️⃣ **Select Multiple Images**
- File picker opens automatically
- **Hold Ctrl** (Windows) or **Cmd** (Mac) to select multiple
- Or drag-select 2+ images
- Click **Open**

### 5️⃣ **Wait for Upload**
You'll see notifications:
```
⏳ Uploading 4 images...
✅ Carousel created - 4 images uploaded successfully
```

### 6️⃣ **Preview in Editor**
The carousel appears with:
- First image visible
- Navigation controls
- Dashed border (editor preview only)

### 7️⃣ **Continue Editing**
- Add more text above/below
- Add another carousel if needed
- Mix with regular images

### 8️⃣ **Publish Post**
- Set to "Published"
- Save changes
- View on website

---

## 👀 What Readers See

### Desktop View:
```
┌─────────────────────────────────────────┐
│                                         │
│        [Large Image Display]            │  ← Auto-plays every 5s
│                                         │
│         ◁  [● ○ ○ ○ ○]  ▷              │  ← Navigation
│                                         │
│     [🖼️] [🖼️] [🖼️] [🖼️] [🖼️]         │  ← Thumbnails (2-5 images)
└─────────────────────────────────────────┘
          "2 / 5" counter shows
```

### Mobile View:
```
┌──────────────────┐
│                  │
│  [Large Image]   │
│                  │
│   ◁ [● ○ ○] ▷   │
│    "2 / 3"       │
└──────────────────┘
```

---

## ✨ Carousel Features

### 🎬 **Auto-Play**
- Changes image every 5 seconds
- Pauses when user clicks navigation
- Smooth fade transitions

### 🎮 **Manual Controls**
- **◁ Button**: Previous image
- **▷ Button**: Next image
- **● Dots**: Click to jump to specific image
- **Thumbnails**: Click small image to view

### 📊 **Visual Feedback**
- Image counter: "3 / 5"
- Active dot highlighted
- Active thumbnail has blue border

---

## 💡 Best Practices

### ✅ DO:
- Use **3-5 images** per carousel
- Keep images **under 2MB** each
- Use **similar aspect ratios**
- Place between paragraphs
- Add context text before/after

### ❌ DON'T:
- Upload 1 image (use regular image instead)
- Upload 10+ images (too slow)
- Mix portrait + landscape randomly
- Use very large files (slow loading)

---

## 📏 Recommended Image Specs

| Aspect Ratio | Dimensions | Best For |
|--------------|------------|----------|
| **16:9** | 1920x1080 | Landscapes, panoramas |
| **4:3** | 1600x1200 | General photos |
| **1:1** | 1080x1080 | Square Instagram-style |

**File Size**: 200KB - 2MB per image  
**Format**: JPG, PNG, WebP  
**Max per carousel**: No hard limit, but 3-5 is optimal  

---

## 🎨 Example Use Cases

### 1. **Product Reviews**
```
"Here are 5 angles of the emergency survival kit:"
[Carousel: Front, Back, Open, Contents, Packed]
"As you can see from the images above..."
```

### 2. **Step-by-Step Guides**
```
"Follow these steps to build a shelter:"
[Carousel: Step1.jpg, Step2.jpg, Step3.jpg, Step4.jpg]
"Each image shows the progressive stages..."
```

### 3. **Before/After Comparisons**
```
"The transformation is remarkable:"
[Carousel: Before1, Before2, After1, After2]
"Notice the dramatic difference..."
```

### 4. **Event Coverage**
```
"Photos from the preparedness workshop:"
[Carousel: 8 event photos]
"Over 50 attendees participated..."
```

---

## 🔧 Technical Details

### Storage:
- Images uploaded to: `post-images/content-images/`
- Public URLs generated automatically
- Stored in Supabase Storage

### HTML Output:
```html
<div class="image-carousel" data-images='["url1","url2","url3"]'>
  <!-- Carousel markup -->
</div>
```

### Rendering:
- Server: Saves HTML in `posts.body` column
- Client: Parses and renders React component
- Mobile: Same component, responsive CSS

---

## ❓ FAQ

**Q: Can I edit carousel after creating it?**  
A: Currently no - delete and recreate. Future update will add editing.

**Q: Can I add captions to each image?**  
A: Not yet - planned for future update.

**Q: Does it work with videos?**  
A: Images only for now - video support coming later.

**Q: Can I reorder images?**  
A: Upload them in the order you want them displayed.

**Q: What if upload fails?**  
A: Check file size (<5MB each), internet connection, and try again.

**Q: Can I have multiple carousels in one post?**  
A: Yes! Add as many as you need, anywhere in the content.

**Q: Does it slow down the page?**  
A: No - images lazy load, only visible image loads fully.

---

## 🎉 You're Ready!

The carousel feature is fully functional and ready to use. Try creating a test post with 3-4 images to see it in action!

**Need help?** Check `IMAGE_CAROUSEL_FEATURE.md` for detailed documentation.

---

**Last Updated**: September 2, 2026  
**Status**: ✅ Production Ready
