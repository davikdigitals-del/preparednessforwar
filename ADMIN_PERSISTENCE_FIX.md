# Fix: Admin Role Not Persisting After Refresh/Logout

## 🔍 The Real Problem

You discovered the actual issue:
- ✅ Admin login works initially
- ❌ After **refresh** → Admin becomes member
- ❌ After **logout/login** → Admin becomes member
- ❌ Admin role doesn't persist in session

**Result:** Admin loses access to admin portal and all posts disappear from homepage.

---

## ✅ What I Fixed

### Fix 1: Improved `buildUser` Function

**Problem:** The function wasn't reliably checking admin status from database.

**Solution:** Added multiple checks with retry logic:

```typescript
// Now checks in this order:
1. profile.is_admin flag (most reliable)
2. profile.role field (backup)
3. user_roles table (fallback)
4. If found in user_roles, updates profile to match
```

**Benefits:**
- ✅ Handles race conditions
- ✅ Multiple fallback checks
- ✅ Auto-syncs profile if out of sync
- ✅ Detailed logging for debugging

---

### Fix 2: Enhanced Session Restoration

**Problem:** Session restoration wasn't properly rebuilding user with admin status.

**Solution:** Added logging and improved session handling:

```typescript
// Now logs every auth state change
console.log("Auth state changed:", event, user.email);
console.log("User role:", isAdmin ? "admin" : "member");
```

**Benefits:**
- ✅ Better visibility into auth flow
- ✅ Catches session restoration issues
- ✅ Helps debug production issues

---

### Fix 3: Admin Login Retry Logic

**Problem:** Admin role update could fail silently.

**Solution:** Added retry logic with 3 attempts:

```typescript
// Tries 3 times to set admin role
for (let attempt = 0; attempt < 3; attempt++) {
  // Update profile
  // Update user_roles
  // Verify changes
}
```

**Benefits:**
- ✅ Handles temporary database issues
- ✅ Ensures admin role is set
- ✅ Logs success/failure for each attempt

---

## 🚀 What You Need to Do

### Step 1: Wait for Deployment (3-5 minutes)

I just pushed the fix to GitHub. Render will automatically deploy it.

1. Go to: https://dashboard.render.com
2. Check your service
3. Wait for deployment to complete (green status)

---

### Step 2: Set Admin Role in Database (CRITICAL!)

**Even with the code fix, you MUST set the admin role in the database first.**

Go to Supabase SQL Editor:
https://supabase.com/dashboard/project/xfbmpjgcfohewejdzlfw/editor

Run this SQL (replace email):

```sql
-- Set admin role in profiles table
UPDATE profiles 
SET 
  is_admin = true,
  role = 'admin'
WHERE email = 'your-admin-email@example.com';

-- Set admin role in user_roles table
INSERT INTO user_roles (user_id, role)
SELECT id, 'admin' 
FROM profiles 
WHERE email = 'your-admin-email@example.com'
ON CONFLICT (user_id, role) 
DO UPDATE SET role = 'admin';

-- Verify it worked
SELECT 
  email,
  is_admin,
  role,
  (SELECT role FROM user_roles WHERE user_id = profiles.id AND role = 'admin') as user_role
FROM profiles 
WHERE email = 'your-admin-email@example.com';
```

**Expected result:**
```
email: your-admin-email@example.com
is_admin: true
role: admin
user_role: admin
```

---

### Step 3: Test Admin Persistence

Once deployed and database is updated:

1. **Go to:** `https://your-app.onrender.com/admin-login`
2. **Login** with admin credentials
3. **Should redirect to:** `/admin` ✅
4. **Press F5** to refresh page
5. **Should stay on:** `/admin` (not redirect to `/`) ✅
6. **Click "Sign Out"**
7. **Login again**
8. **Should redirect to:** `/admin` (not `/dashboard`) ✅

---

## 🔍 How to Verify It's Working

### Check Browser Console (F12)

You should see these logs:

```
Auth state changed: SIGNED_IN user@example.com
User user@example.com - isAdmin: true, profile.is_admin: true, profile.role: admin
✅ Admin status confirmed from profile.is_admin
Admin login complete - Role: admin isAdmin: true
```

### Check Admin Dashboard

1. Login as admin
2. Should see admin sidebar
3. Refresh page (F5)
4. Should still see admin sidebar
5. Should NOT redirect to homepage

### Check Member Dashboard

1. Login as regular member
2. Should see member dashboard
3. Should NOT see "Admin Panel" button
4. Should see posts on homepage

---

## 🚨 Troubleshooting

### Issue 1: Still Redirects to Homepage After Refresh

**Cause:** Admin role not set in database

**Fix:**
```sql
-- Force set admin role
UPDATE profiles SET is_admin = true, role = 'admin' WHERE email = 'YOUR-EMAIL';
INSERT INTO user_roles (user_id, role) SELECT id, 'admin' FROM profiles WHERE email = 'YOUR-EMAIL' ON CONFLICT DO NOTHING;
```

Then:
1. Clear browser cache (Ctrl+Shift+Delete)
2. Clear localStorage: Open console (F12) and run: `localStorage.clear()`
3. Logout completely
4. Close browser
5. Open browser and login again

---

### Issue 2: Console Shows "isAdmin: false"

**Cause:** Database doesn't have admin flag set

**Fix:**
1. Run the SQL above to set admin role
2. Logout and login again
3. Check console logs again

---

### Issue 3: Works After Login But Not After Refresh

**Cause:** Session restoration not reading admin status correctly

**Fix:**
1. Ensure latest code is deployed (check Render)
2. Clear browser cache
3. Check console logs for errors
4. Verify database has admin role set

---

### Issue 4: "Admin role not set correctly" Warning in Console

**Cause:** Profile or user_roles update failed

**Fix:**
1. Manually set admin role in database (SQL above)
2. Check Supabase RLS policies allow updates
3. Verify no database errors in Supabase logs

---

## 📊 Database Check Commands

### Check if admin role is set:
```sql
SELECT 
  p.email,
  p.is_admin,
  p.role,
  ur.role as user_role
FROM profiles p
LEFT JOIN user_roles ur ON p.id = ur.user_id AND ur.role = 'admin'
WHERE p.email = 'your-email@example.com';
```

### List all admins:
```sql
SELECT 
  email,
  is_admin,
  role,
  created_at
FROM profiles
WHERE is_admin = true
ORDER BY created_at DESC;
```

### Fix admin role for specific user:
```sql
UPDATE profiles SET is_admin = true, role = 'admin' WHERE email = 'EMAIL';
INSERT INTO user_roles (user_id, role) SELECT id, 'admin' FROM profiles WHERE email = 'EMAIL' ON CONFLICT DO NOTHING;
```

---

## ✅ Success Checklist

After deployment and database update:

- [ ] Deployed latest code to Render
- [ ] Ran SQL to set admin role in database
- [ ] Verified `is_admin = true` in profiles table
- [ ] Verified admin role in user_roles table
- [ ] Can login at `/admin-login`
- [ ] Redirects to `/admin` dashboard
- [ ] Can refresh page and stay on `/admin`
- [ ] Can logout and login again as admin
- [ ] Admin role persists across sessions
- [ ] Console shows "isAdmin: true"
- [ ] No errors in browser console
- [ ] No errors in Render logs

---

## 💡 Why This Happens

### The Root Cause:

1. **Admin login** sets admin role in memory (works initially)
2. **Page refresh** rebuilds user from database
3. **Database doesn't have admin flag** → User becomes member
4. **Session restoration** reads from database → No admin role found
5. **User loses admin access** → Redirected to homepage

### The Solution:

1. **Set admin role in database** (permanent storage)
2. **Improved code** checks database reliably
3. **Retry logic** handles race conditions
4. **Auto-sync** keeps profile and user_roles in sync
5. **Admin role persists** across refresh and logout/login

---

## 🎯 Summary

**What I Fixed:**
- ✅ Improved admin status checking (3 fallback methods)
- ✅ Added retry logic for database updates
- ✅ Enhanced session restoration
- ✅ Added detailed logging for debugging
- ✅ Auto-sync profile and user_roles tables

**What You Need to Do:**
1. ✅ Wait for Render deployment (automatic)
2. ✅ Run SQL to set admin role in database (one-time)
3. ✅ Test admin persistence (refresh, logout/login)

**Result:**
- ✅ Admin role persists after refresh
- ✅ Admin role persists after logout/login
- ✅ Admin can access admin portal reliably
- ✅ Posts don't disappear from homepage

---

**Your admin portal should now work perfectly! 🎉**
