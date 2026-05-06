# Test Supabase Connection

## Issue
Admin pages are timing out when loading data from Supabase.

## Possible Causes
1. **No data in database** - Tables might be empty
2. **RLS policies blocking queries** - Row Level Security might be preventing reads
3. **Wrong Supabase credentials** - Check .env file
4. **Network/connection issues** - Supabase might be unreachable

## Quick Test

Open your browser console on the admin page and run:

```javascript
// Test 1: Check if Supabase is connected
console.log("Supabase URL:", import.meta.env.VITE_SUPABASE_URL);

// Test 2: Try a simple query
const { data, error } = await supabase.from("posts").select("count");
console.log("Posts count:", data, error);

// Test 3: Check auth
const { data: { user } } = await supabase.auth.getUser();
console.log("Current user:", user);
```

## Solution Steps

### 1. Verify .env file exists and has correct values
Check that `.env` file has:
```
VITE_SUPABASE_URL="https://your-project.supabase.co"
VITE_SUPABASE_ANON_KEY="your-anon-key"
```

### 2. Check if database has data
Run this SQL in Supabase SQL Editor:
```sql
SELECT COUNT(*) FROM posts;
SELECT COUNT(*) FROM categories;
SELECT COUNT(*) FROM sections;
```

### 3. Check RLS policies
Run this SQL to temporarily disable RLS for testing:
```sql
ALTER TABLE posts DISABLE ROW LEVEL SECURITY;
ALTER TABLE categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE sections DISABLE ROW LEVEL SECURITY;
```

**WARNING**: Only do this for testing! Re-enable after:
```sql
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE sections ENABLE ROW LEVEL SECURITY;
```

### 4. If RLS is the issue, add admin bypass policy
```sql
-- Allow admins to read everything
CREATE POLICY "Admins can read all posts"
ON posts FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.is_admin = true
  )
);
```

## Current Status
- Removed timeout from AdminPosts
- Added query limit (100 posts max)
- Added better logging
- Using consistent Supabase import path

## Next Steps
1. Check browser console for actual error messages
2. Verify Supabase connection in browser dev tools
3. Check if data exists in database
4. Verify RLS policies allow admin access
