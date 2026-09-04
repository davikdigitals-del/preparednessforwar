# Image Carousel Feature for Rich Text Editor

## ✨ Overview
The rich text editor now supports **image carousels/galleries** for article posts. You can upload multiple images at once and they'll display as an interactive carousel with navigation controls.

## 🎯 Features

### 1. **Multiple Image Upload**
- Select 2+ images at once
- Maximum 5MB per image
- Automatic upload to Supabase storage
- Progress notification

### 2. **Interactive Carousel**
- Auto-play (5 second intervals)
- Manual navigation (previous/next buttons)
- Dot indicators for all slides
- Image counter (e.g., "3 / 5")
- Click dot to jump to specific slide
- Thumbnail strip (for 2-5 images)

### 3. **Responsive Design**
- Adapts to mobile and desktop
- Touch-friendly controls
- Optimized image loading

## 📝 How to Use

### In Admin Posts Editor:

1. **Open Admin → Posts → Create/Edit Post**

2. **Click "Add Image Carousel" button** (above rich text editor)
   - Button shows: 📷 Add Image Carousel

3. **Select Multiple Images**
   - File picker opens
   - Select 2 or more images
   - Click "Open"

4. **Wait for Upload**
   - Toast notification shows progress
   - "Uploading X images..."
   - "Carousel created - X images uploaded successfully"

5. **Carousel Appears in Editor**
   - Shows first image
   - Navigation controls visible
   - Can continue editing text around it

6. **Save Post**
   - Carousel data embedded in HTML
   - Published post shows interactive carousel

### On Article Page:

- **Readers see:**
  - Full carousel with smooth transitions
  - Previous/Next buttons
  - Dot navigation
  - Image counter
  - Auto-play (can pause by clicking nav)
  - Thumbnail strip (if 2-5 images)

## 🛠️ Technical Implementation

### Components Created:

1. **`RichTextEditor.tsx`** (Updated)
   - Added `carouselHandler` function
   - Multi-file upload support
   - Inserts carousel HTML with `data-images` attribute

2. **`ImageCarousel.tsx`** (New)
   - Standalone React carousel component
   - Auto-play with 5s intervals
   - Manual controls and thumbnails

3. **`carouselParser.tsx`** (New Utils)
   - `parseContentWithCarousels()` - Extracts carousel HTML, replaces with React component
   - `hasCarousels()` - Checks if content contains carousels

4. **`ArticlePage.tsx`** (Updated)
   - Detects carousel markup in post body
   - Renders React carousel component
   - Works in both mobile and desktop layouts

### Data Format:

Carousel HTML in database:
```html
<div class="image-carousel" data-carousel-id="carousel-1234567890" data-images='["url1.jpg","url2.jpg","url3.jpg"]'>
  <!-- Carousel markup for editor preview -->
</div>
```

## 🎨 Styling

### In Editor (Preview):
- Dashed border
- Gray background
- Labeled "Carousel"
- Basic navigation

### On Article Page:
- Full-width aspect ratio (16:9)
- Black background
- Smooth fade transitions
- Professional controls
- Blue accent color

## 📱 Mobile vs Desktop

### Mobile:
- Swipe navigation (future enhancement)
- Touch-friendly buttons
- Responsive dots
- No thumbnails (saves space)

### Desktop:
- Hover effects
- Keyboard navigation (future enhancement)
- Thumbnail strip visible
- Larger click targets

## 🚀 Future Enhancements

Possible additions:
- [ ] Captions for each image
- [ ] Lightbox/fullscreen mode
- [ ] Swipe gestures on mobile
- [ ] Keyboard arrow key navigation
- [ ] Image alt text editor
- [ ] Drag-and-drop reordering
- [ ] Delete individual images
- [ ] Video support in carousel

## 💡 Tips

1. **Optimal Image Count**: 3-5 images works best
2. **Image Size**: Keep under 2MB per image for fast loading
3. **Aspect Ratio**: Use similar aspect ratios for best results
4. **Placement**: Add carousels between paragraphs, not inline
5. **Alt Text**: Regular editor images still support individual alt text

## 🐛 Troubleshooting

**Carousel not showing?**
- Check browser console for errors
- Verify images uploaded successfully
- Ensure post.body contains carousel HTML

**Images not loading?**
- Check Supabase storage permissions
- Verify public URL access
- Check image file extensions

**Editor crashes?**
- Check file size limits
- Try fewer images at once
- Check browser console

## 📦 Files Modified

```
src/
├── components/
│   ├── RichTextEditor.tsx (✅ Updated - carousel button & upload)
│   └── ImageCarousel.tsx (🆕 New - carousel component)
├── utils/
│   └── carouselParser.tsx (🆕 New - HTML parser)
└── pages/
    └── ArticlePage.tsx (✅ Updated - carousel rendering)
```

## ✅ Testing Checklist

- [x] Upload 2 images → Carousel created
- [x] Upload 5 images → All display correctly
- [x] Navigation buttons work
- [x] Dot indicators work
- [x] Auto-play functions
- [x] Mobile responsive
- [x] Desktop layout correct
- [x] Saves to database
- [x] Displays on article page

---

**Status**: ✅ Complete and Ready to Use

**Created**: September 2, 2026
**Last Updated**: September 2, 2026
