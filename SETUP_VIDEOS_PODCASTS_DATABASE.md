# Setup Videos & Podcasts Database

## Quick Setup Guide

### Step 1: Check if Table Exists
1. Open Supabase Dashboard: https://supabase.com/dashboard
2. Go to **SQL Editor**
3. Run: `database/CHECK_MEDIA_ITEMS.sql`
4. Check the results:
   - ✅ If table exists → Skip to Step 3
   - ❌ If table doesn't exist → Continue to Step 2

### Step 2: Create the Table
1. In Supabase SQL Editor
2. Run: `database/CREATE_MEDIA_ITEMS_TABLE.sql`
3. Wait for success message
4. Should see: "✅ Media items table created successfully!"

### Step 3: Test the Admin Page
1. Go to your app: http://localhost:8080/admin/podcast-videos
2. Click **"Add Media"**
3. Create a test video or podcast
4. Should see it in the table

---

## What Gets Created

### Table: `media_items`
```sql
Columns:
  - id (UUID, primary key)
  - title (text, required)
  - description (text)
  - type (text, 'video' or 'podcast')
  - url (text, required)
  - thumbnail (text)
  - duration (text)
  - author (text)
  - tags (text array)
  - is_premium (boolean)
  - views (integer)
  - published_at (timestamp)
  - created_at (timestamp)
  - updated_at (timestamp)
```

### Indexes
- `idx_media_items_type` - Fast filtering by type
- `idx_media_items_published_at` - Fast sorting by date
- `idx_media_items_is_premium` - Fast filtering premium content
- `idx_media_items_tags` - Fast tag searches

### RLS Policies
- Public can read all media items
- Authenticated users can create/edit/delete
- Very permissive for easy management

### Functions
- `update_updated_at_column()` - Auto-updates timestamp
- `increment_media_views()` - Tracks view counts

### Sample Data (Optional)
- 1 sample video
- 1 sample podcast
- Can be removed if you don't want them

---

## Verification Checklist

After running the setup script, verify:

- [ ] Table `media_items` exists
- [ ] 4 indexes created
- [ ] 5 RLS policies created
- [ ] RLS is enabled
- [ ] Sample data inserted (2 items)
- [ ] Can access `/admin/podcast-videos`
- [ ] Can create new media items
- [ ] Can edit existing items
- [ ] Can delete items

---

## Troubleshooting

### Issue: "Table already exists"
**Solution**: Table is already set up! Skip to testing.

### Issue: "Permission denied"
**Solution**: Make sure you're logged in as admin in Supabase dashboard.

### Issue: "Can't insert data"
**Solution**: Check RLS policies are created. Run the setup script again.

### Issue: "Admin page shows empty"
**Solution**: 
1. Check if table exists: Run `CHECK_MEDIA_ITEMS.sql`
2. Check browser console for errors (F12)
3. Verify Supabase connection in `.env` file

---

## SQL Files Reference

| File | Purpose |
|------|---------|
| `CREATE_MEDIA_ITEMS_TABLE.sql` | Creates table, indexes, policies, sample data |
| `CHECK_MEDIA_ITEMS.sql` | Checks if table exists and shows current data |

---

## Next Steps

After setup:

1. **Remove sample data** (optional):
   ```sql
   DELETE FROM media_items WHERE author = 'Preparedness Team' OR author = 'John Doe';
   ```

2. **Add your first video**:
   - Go to `/admin/podcast-videos`
   - Click "Add Media"
   - Select "Video"
   - Paste YouTube URL
   - Fill in details
   - Click "Create"

3. **Add your first podcast**:
   - Click "Add Media"
   - Select "Podcast"
   - Paste Spotify/Apple Podcasts URL
   - Fill in details
   - Click "Create"

---

## Important Notes

1. **Separate from posts** - This table is NOT related to the `posts` table
2. **No sections/categories** - Media items don't have sections or categories
3. **Standalone system** - Completely independent media library
4. **Different purpose** - For standalone videos/podcasts, not article supplements

---

## Summary

✅ **Run**: `database/CREATE_MEDIA_ITEMS_TABLE.sql` in Supabase SQL Editor
✅ **Check**: Table created with indexes and policies
✅ **Test**: Go to `/admin/podcast-videos` and create media
✅ **Done**: Videos & Podcasts system is ready!

The table is now ready for managing your video and podcast library!
