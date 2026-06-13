# Featured Posts Debugging Guide

## Current Status
✅ **Build errors fixed** - Deployment should now succeed
🔧 **Featured posts system implemented** - Needs verification
⚠️ **Posts exist in Supabase but may not show in menu** - Needs debugging

---

## How The System Works

### 1. Database Structure
- Posts have an `is_pinned` column (boolean)
- When `is_pinned = true`, the post becomes "Featured" in the mega menu
- **Limit: Maximum 2 featured posts per section**

### 2. Data Flow
```
Supabase `posts` table
  ↓ (where is_pinned = true)
useFeaturedPosts hook
  ↓ (returns map: section -> array of posts)
SiteHeader component
  ↓ (passes to buildMenuConfig)
MegaMenu component
  ↓ (displays in Featured section)
```

### 3. Key Files
- `src/hooks/useFeaturedPosts.ts` - Fetches pinned posts from Supabase
- `src/components/layout/SiteHeader.tsx` - Passes data to menu
- `src/pages/admin/AdminPosts.tsx` - Pin/unpin button with validation

---

## Debugging Steps (Follow These!)

### Step 1: Check Browser Console Logs
Open your browser DevTools Console and look for these emoji markers:

**🔍** - "Fetching featured posts..." (hook is querying)
**📊** - "Featured posts query result" (shows data from Supabase)
**✅** - "Featured map created" (shows the final map structure)
**🔧** - "Building menu for section" (shows which posts are used per section)
**✨** - "Featured items for [section]" (shows final items in menu)
**📌** - "Pin button clicked" (when you click pin/unpin in admin)

### Step 2: What to Check in Console
```javascript
// You should see something like:
🔍 Fetching featured posts...
📊 Featured posts query result: { data: [{ id: "...", title: "...", section: "emergency", is_pinned: true }], error: null }
✅ Featured map created: { emergency: [{ id: "...", title: "..." }] }
```

**If data is empty or null:**
- Posts might not have `is_pinned = true` in Supabase
- RLS policies might be blocking the query
- Go to Step 3

**If data exists but menu is empty:**
- Check the "Featured map created" log
- Verify section names match (e.g., "emergency" not "Emergency")
- Go to Step 4

### Step 3: Fix RLS Policies in Supabase
Run this SQL in Supabase SQL Editor:

```sql
-- File: database/CHECK_AND_FIX_PIN_PERMISSIONS.sql
-- This checks and fixes Row Level Security policies

-- 1. Check current policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'posts';

-- 2. Drop old restrictive policies if they exist
DROP POLICY IF EXISTS "Posts are viewable by everyone" ON posts;
DROP POLICY IF EXISTS "Users can view published posts" ON posts;

-- 3. Create a policy that allows reading ALL posts (including is_pinned)
CREATE POLICY "Enable read access for all users"
ON posts FOR SELECT
TO public
USING (true);

-- 4. Allow authenticated users to update posts (for admin pin/unpin)
CREATE POLICY "Enable update for authenticated users only"
ON posts FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- 5. Verify the new policies
SELECT policyname, permissive, roles, cmd
FROM pg_policies
WHERE tablename = 'posts';
```

### Step 4: Test Pin/Unpin in Admin

1. Go to `/admin/posts` in your app
2. Click the 📌 icon on a post
3. Check browser console for:
   ```
   📌 Pin button clicked for post: [id]
   Current pinned posts in section: [array]
   Updating is_pinned to: true/false
   ✅ Update successful!
   ```

**If you see "Maximum Limit Reached":**
- That section already has 2 pinned posts
- Unpin one before pinning another

**If update fails:**
- Check console for error message
- Run the RLS policy fix from Step 3

### Step 5: Verify in Supabase Dashboard

1. Open Supabase Dashboard → Table Editor → `posts`
2. Add a filter: `is_pinned` equals `true`
3. You should see your pinned posts
4. Check the `section` column value (must match menu section slug exactly)

**Section slugs:**
- emergency
- survival
- bunker
- security
- community

### Step 6: Test Realtime Updates

The system uses realtime subscriptions. When you pin/unpin a post:
1. The change is instant (no page refresh needed)
2. Check console for new "Fetching featured posts..." log
3. Menu should update within 1-2 seconds

---

## Common Issues & Fixes

### Issue: Posts don't show in menu
**Fix:**
- Section name mismatch (check `section` column in database)
- Post is not published (`status = 'published'`)
- RLS policy blocking (run Step 3)

### Issue: Can't pin more than 2 posts per section
**Fix:**
- This is by design (maximum 2 featured posts per section)
- Unpin an existing post first

### Issue: Pin button doesn't work
**Fix:**
- Check browser console for errors
- Verify user is authenticated
- Run RLS policy fix from Step 3

### Issue: Menu shows old/cached data
**Fix:**
- Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
- Clear localStorage: F12 → Application → Local Storage → Clear
- Check realtime subscription in console

---

## Testing Checklist

- [ ] Open browser console (F12)
- [ ] Navigate to homepage
- [ ] Look for 🔍 "Fetching featured posts" log
- [ ] Verify 📊 data is returned (not empty/null)
- [ ] Hover over a section in the nav menu
- [ ] Check 🔧 "Building menu for section" log
- [ ] Verify ✨ "Featured items" shows posts
- [ ] Go to `/admin/posts`
- [ ] Click 📌 on a post to pin it
- [ ] Check for "Update successful" toast
- [ ] Return to homepage
- [ ] Hover over menu again - should show new featured post
- [ ] Try pinning a 3rd post in same section - should show error

---

## Contact Info for Further Help

If featured posts still don't show after following all steps:

1. **Share these console logs:**
   - Screenshot of "Featured posts query result"
   - Screenshot of "Featured map created"
   - Screenshot of "Featured items for [section]"

2. **Share this Supabase query result:**
   ```sql
   SELECT id, title, section, is_pinned, status, published_at
   FROM posts
   WHERE is_pinned = true
   ORDER BY section, published_at DESC;
   ```

3. **Share RLS policies:**
   ```sql
   SELECT policyname, permissive, roles, cmd
   FROM pg_policies
   WHERE tablename = 'posts';
   ```
