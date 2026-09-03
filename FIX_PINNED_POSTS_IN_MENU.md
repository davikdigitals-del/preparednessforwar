# 🔧 Fix: Pinned Posts Not Showing in Navigation Menu

## Problem
Pin button works in Admin → Posts, but pinned posts don't appear in the navigation menu dropdown under "Featured".

## Step-by-Step Fix

### Step 1: Check Database Permissions ✅ IMPORTANT
1. Open **Supabase Dashboard** → **SQL Editor**
2. Run `database/FIX_POST_PIN.sql` (this fixes RLS policies)
3. Click **Run**

### Step 2: Verify Pinned Posts Exist
1. In **SQL Editor**, run `DEBUG_FEATURED_POSTS.sql`
2. Check results:
   - **Query 1**: Shows all pinned posts (any status)
   - **Query 2**: Shows published + pinned posts (what the menu uses)
   
**Expected**: Query 2 should return at least 1 post per section

**If Query 2 is empty:**
- Go to Admin → Posts
- Find a published post
- Click the 📌 pin button
- Refresh and run Query 2 again

### Step 3: Check Browser Console Logs
1. Open your site in browser
2. Press **F12** to open DevTools → Console tab
3. Refresh the page
4. Look for these logs:

```
🔍 Fetching featured posts...
📊 Featured posts query result: { data: [...], error: null }
✅ Featured map created: { section-slug: [...] }
```

**If you see:**
- ✅ `data: [...]` with posts → Database query works
- ❌ `data: []` empty → No pinned posts OR permission issue
- ❌ `error: "..."` → Database permission problem (run Step 1)

### Step 4: Check Menu Builder Logs
While hovering over a navigation menu item, check console for:

```
🎯 Building menu for section-slug: {
  hasSection: true,
  featuredForThisSection: [...],
  allFeaturedMap: {...}
}
🔧 Building menu for section: section-slug { featuredPosts: [...] }
✨ Featured items for section-slug: [...]
```

**If `featuredForThisSection` is empty:**
- The section slug in the menu doesn't match the section slug in posts
- Example: Menu uses "supplies" but posts use "essential-supplies"

### Step 5: Verify Section Slugs Match
Run this SQL to check section names:

```sql
-- What sections are in posts?
SELECT DISTINCT section, COUNT(*) as post_count
FROM posts
WHERE is_pinned = true AND status = 'published'
GROUP BY section;

-- What sections are in nav?
SELECT slug, title, is_active
FROM sections
WHERE is_active = true;
```

**Slugs MUST match exactly** between posts.section and sections.slug

---

## Common Issues & Fixes

### Issue 1: Permission Denied
**Error**: `error: { code: "42501", message: "permission denied" }`

**Fix**: Run `database/FIX_POST_PIN.sql` in Supabase SQL Editor

---

### Issue 2: No Pinned Posts
**Symptom**: `data: []` in console

**Fix**:
1. Go to Admin → Posts
2. Click 📌 on a **published** post
3. Max 2 pins per section
4. Refresh browser

---

### Issue 3: Section Slug Mismatch
**Symptom**: `featuredForThisSection: undefined`

**Example Problem**:
- Menu navigation uses: `supplies`
- Posts database has: `essential-supplies`

**Fix**: Update either:
- **Option A**: Change post section in Admin → Posts
- **Option B**: Update section slug in Admin → Sections

**They must match!**

---

### Issue 4: Cache Issue
**Symptom**: Everything looks right but still not showing

**Fix**:
1. Hard refresh: `Ctrl + Shift + R` (or `Cmd + Shift + R` on Mac)
2. Clear browser cache
3. Try incognito/private window

---

## Quick Test

1. **Pin a post**: Admin → Posts → Click 📌 on any published post
2. **Open browser console**: F12
3. **Refresh page**: Look for featured posts logs
4. **Hover over menu**: Check if "Featured" section appears with pinned posts

---

## What The Code Does

### 1. `useFeaturedPosts` Hook
```typescript
// Fetches from database
.eq("status", "published")
.eq("is_pinned", true)

// Groups by section (max 2 per section)
{ "supplies": [...], "security": [...] }
```

### 2. Menu Builder
```typescript
// Gets posts for specific section
featuredMap[item.section] → [...posts...]

// Builds featured items
featured: {
  heading: "Featured",
  items: featuredItems
}
```

### 3. MegaMenuContent
Receives config with featured items and displays them in dropdown.

---

## Still Not Working?

Share these console logs:
1. 🔍 Fetching featured posts...
2. 📊 Featured posts query result
3. 🎯 Building menu for [section]

And tell me:
- Which section are you pinning posts to?
- Is the post status = "published"?
- What error (if any) appears in console?
