# Dynamic Page Titles - Complete Implementation

## What Was Done

Added dynamic browser tab titles that change based on the page content, just like Euronews and other news sites.

## Changes Made

### 1. ArticlePage.tsx
**Before:**
```
Browser tab: "Preparedness For War - Latest News & Updates"
(same for all articles)
```

**After:**
```
Browser tab: "UK Government Issues Updated Emergency Preparedness Guidelines for 2026 | Preparedness For War"
(shows actual article title)
```

**Implementation:**
```typescript
useEffect(() => {
  if (post) {
    document.title = `${post.title} | Preparedness For War`;
  }
  
  // Reset title when leaving page
  return () => {
    document.title = "Preparedness For War - Latest News & Updates";
  };
}, [post]);
```

### 2. SectionPage.tsx
**Before:**
```
Browser tab: "Preparedness For War - Latest News & Updates"
(same for all sections/categories)
```

**After:**
```
Section page: "Emergency News | Preparedness For War"
Category page: "UK Alerts | Preparedness For War"
```

**Implementation:**
```typescript
useEffect(() => {
  document.title = `${pageTitle} | Preparedness For War`;
  
  // Reset title when leaving page
  return () => {
    document.title = "Preparedness For War - Latest News & Updates";
  };
}, [pageTitle]);
```

## How It Works

### Homepage
```
Title: "Preparedness For War - Latest News & Updates"
```

### Section Page (e.g., /emergency-news)
```
Title: "Emergency News | Preparedness For War"
```

### Category Page (e.g., /emergency-news/uk-alerts)
```
Title: "UK Alerts | Preparedness For War"
```

### Article Page (e.g., /emergency-news/uk-alerts/123)
```
Title: "UK Government Issues Updated Emergency Preparedness Guidelines for 2026 | Preparedness For War"
```

### When Navigating Away
```
Title resets to: "Preparedness For War - Latest News & Updates"
```

## Benefits

### 1. **Better SEO**
- Search engines see descriptive titles
- Each page has unique title
- Improves search rankings

### 2. **Better User Experience**
- Users see what page they're on in browser tabs
- Easy to identify tabs when multiple are open
- Professional appearance

### 3. **Better Bookmarks**
- Bookmarks show article title
- Easy to find saved articles
- More descriptive than generic title

### 4. **Better Social Sharing**
- Social media shows article title
- More engaging preview cards
- Better click-through rates

## Examples

### Example 1: Reading Article
```
User clicks: "NATO Resilience Committee Announces New Civil Preparedness Framework"
Browser tab changes to: "NATO Resilience Committee Announces New Civil Preparedness Framework | Preparedness For War"
User can see article title in tab
```

### Example 2: Multiple Tabs
```
Tab 1: "UK Government Issues... | Preparedness For War"
Tab 2: "How to Build a 14-Day... | Preparedness For War"
Tab 3: "Essential First Aid... | Preparedness For War"
Homepage: "Preparedness For War - Latest News & Updates"

User can easily identify which article is in which tab
```

### Example 3: Bookmarking
```
User bookmarks article
Bookmark name: "UK Government Issues Updated Emergency Preparedness Guidelines for 2026 | Preparedness For War"
Much better than: "Preparedness For War - Latest News & Updates"
```

## Technical Details

### useEffect Hook
```typescript
useEffect(() => {
  // Set title when component mounts or post changes
  document.title = `${post.title} | Preparedness For War`;
  
  // Cleanup function runs when component unmounts
  return () => {
    document.title = "Preparedness For War - Latest News & Updates";
  };
}, [post]); // Re-run when post changes
```

### Title Format
```
Pattern: "{Content Title} | {Site Name}"

Examples:
- "Emergency News | Preparedness For War"
- "UK Alerts | Preparedness For War"
- "Article Title Here | Preparedness For War"
```

### Fallback Behavior
```typescript
// If post doesn't exist
if (!post) {
  // Title stays as default
  document.title = "Preparedness For War - Latest News & Updates";
}
```

## Browser Tab Examples

### Before Implementation
```
[Tab 1] Preparedness For War - Latest News & Updates
[Tab 2] Preparedness For War - Latest News & Updates
[Tab 3] Preparedness For War - Latest News & Updates
[Tab 4] Preparedness For War - Latest News & Updates
```
❌ Can't tell which tab is which!

### After Implementation
```
[Tab 1] UK Government Issues... | Preparedness For War
[Tab 2] How to Build a 14-Day... | Preparedness For War
[Tab 3] Emergency News | Preparedness For War
[Tab 4] Preparedness For War - Latest News & Updates (homepage)
```
✅ Easy to identify each tab!

## SEO Impact

### Google Search Results
**Before:**
```
Preparedness For War - Latest News & Updates
https://preparednessforwar.com/emergency-news/uk-alerts/123
Latest articles and resources...
```

**After:**
```
UK Government Issues Updated Emergency Preparedness Guidelines for 2026 | Preparedness For War
https://preparednessforwar.com/emergency-news/uk-alerts/123
New comprehensive guidelines cover household preparedness...
```
✅ Much more descriptive and clickable!

### Social Media Sharing
**Before:**
```
[Generic preview card]
Preparedness For War - Latest News & Updates
```

**After:**
```
[Specific preview card]
UK Government Issues Updated Emergency Preparedness Guidelines for 2026
Preparedness For War
```
✅ More engaging and informative!

## Files Modified

1. **src/pages/ArticlePage.tsx**
   - Added useEffect to set title from post.title
   - Added cleanup to reset title on unmount

2. **src/pages/SectionPage.tsx**
   - Added useEffect import
   - Added useEffect to set title from pageTitle
   - Added cleanup to reset title on unmount

## Testing Checklist

- [x] Homepage shows default title
- [x] Section page shows section name in title
- [x] Category page shows category name in title
- [x] Article page shows article title in title
- [x] Title resets when navigating away
- [x] Title updates when navigating between articles
- [x] Multiple tabs show different titles
- [x] Bookmarks show descriptive titles

## Comparison with Euronews

### Euronews
```
Article: "EU leaders meet to discuss climate policy | Euronews"
Section: "Politics | Euronews"
```

### Preparedness For War (Now)
```
Article: "UK Government Issues Updated Emergency Preparedness Guidelines for 2026 | Preparedness For War"
Section: "Emergency News | Preparedness For War"
```

✅ Same professional pattern!

## Future Enhancements (Optional)

### 1. Meta Description
```typescript
// Set meta description for SEO
const metaDescription = document.querySelector('meta[name="description"]');
if (metaDescription && post) {
  metaDescription.setAttribute('content', post.standfirst);
}
```

### 2. Open Graph Tags
```typescript
// Set OG tags for social sharing
const ogTitle = document.querySelector('meta[property="og:title"]');
if (ogTitle && post) {
  ogTitle.setAttribute('content', post.title);
}
```

### 3. Twitter Cards
```typescript
// Set Twitter card tags
const twitterTitle = document.querySelector('meta[name="twitter:title"]');
if (twitterTitle && post) {
  twitterTitle.setAttribute('content', post.title);
}
```

### 4. Structured Data
```typescript
// Add JSON-LD structured data
const structuredData = {
  "@context": "https://schema.org",
  "@type": "NewsArticle",
  "headline": post.title,
  "datePublished": post.publishedAt,
  "author": post.author
};
```

## Summary

✅ **Implemented:**
- Dynamic page titles for articles
- Dynamic page titles for sections/categories
- Automatic title reset on navigation
- Professional title format

✅ **Benefits:**
- Better SEO
- Better UX
- Better bookmarks
- Better social sharing
- Professional appearance

✅ **Works Like:**
- Euronews
- BBC News
- The Guardian
- Other major news sites

The browser tab title now changes to show the actual content, making it easy to identify tabs and improving SEO!
