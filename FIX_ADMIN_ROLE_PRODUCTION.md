# Fix: Admin Logged as Member on Render

## 🔍 Problem

When you login as admin on Render:
- ❌ Gets redirected to homepage or member dashboard
- ❌ Cannot access `/admin` portal
- ❌ Admin is treated as regular member

**Root Cause:** The user's admin role is not set in the production Supabase database.

---

## ✅ Solution: Set Admin Role in Production Database

### Step 1: Access Supabase SQL Editor

1. Go to https://supabase.com/dashboard
2. Select your project: **xfbmpjgcfohewejdzlfw**
3. Click **SQL Editor** in the left sidebar
4. Click **"New query"**

---

### Step 2: Run This SQL to Make User Admin

**Replace `your-admin-email@example.com` with your actual admin email:**

```sql
-- Step 1: Find your user ID
SELECT id, email, is_admin, role 
FROM profiles 
WHERE email = 'your-admin-email@example.com';

-- Step 2: Set admin role in profiles table
UPDATE profiles 
SET 
  is_admin = true,
  role = 'admin'
WHERE email = 'your-admin-email@example.com';

-- Step 3: Add admin role to user_roles table
INSERT INTO user_roles (user_id, role)
SELECT id, 'admin' 
FROM profiles 
WHERE email = 'your-admin-email@example.com'
ON CONFLICT (user_id, role) DO UPDATE SET role = 'admin';

-- Step 4: Verify the changes
SELECT 
  p.id,
  p.email,
  p.name,
  p.is_admin,
  p.role,
  ur.role as user_role
FROM profiles p
LEFT JOIN user_roles ur ON p.id = ur.user_id
WHERE p.email = 'your-admin-email@example.com';
```

**Expected Result:**
```
id: [some-uuid]
email: your-admin-email@example.com
name: Your Name
is_admin: true
role: admin
user_role: admin
```

---

### Step 3: Test Admin Login

1. Go to your Render site: `https://your-app.onrender.com/admin-login`
2. Login with your admin email and password
3. Should now redirect to `/admin` dashboard ✅

---

## 🔧 Alternative: Create New Admin Account

If you don't have an admin account yet, create one:

```sql
-- Step 1: Create admin account (replace with your details)
-- First, sign up on your site at /admin-login
-- Then run this SQL with your email:

UPDATE profiles 
SET 
  is_admin = true,
  role = 'admin'
WHERE email = 'your-new-admin@example.com';

INSERT INTO user_roles (user_id, role)
SELECT id, 'admin' 
FROM profiles 
WHERE email = 'your-new-admin@example.com'
ON CONFLICT (user_id, role) DO UPDATE SET role = 'admin';
```

---

## 🚨 Why This Happens

### The Issue:
When you create an admin account through the `/admin-login` page, the code tries to set the admin role, but:

1. **Race condition:** The profile might not be created yet
2. **RLS policies:** Row-level security might block the update
3. **Timing:** The admin flag is set but not persisted properly

### The Fix:
Manually setting the admin role in the database bypasses these issues and ensures the role is set correctly.

---

## 🔍 Verify Admin Role is Working

After running the SQL, verify the admin role is working:

### Test 1: Check Database
```sql
-- Should return is_admin = true
SELECT id, email, is_admin, role 
FROM profiles 
WHERE email = 'your-admin-email@example.com';
```

### Test 2: Check User Roles Table
```sql
-- Should return role = 'admin'
SELECT * FROM user_roles 
WHERE user_id = (SELECT id FROM profiles WHERE email = 'your-admin-email@example.com');
```

### Test 3: Login and Check
1. Login at `/admin-login`
2. Should redirect to `/admin` (not `/` or `/dashboard`)
3. Should see admin sidebar with all sections
4. Should be able to access all admin pages

---

## 🔄 If Still Not Working

### Check 1: Clear Browser Cache
```
1. Press Ctrl+Shift+Delete (Windows) or Cmd+Shift+Delete (Mac)
2. Select "Cached images and files"
3. Click "Clear data"
4. Try logging in again
```

### Check 2: Check Browser Console
```
1. Press F12
2. Go to Console tab
3. Login as admin
4. Look for errors or logs showing:
   - "Admin login successful, user role: admin"
   - "isAdmin: true"
```

### Check 3: Force Logout and Login
```
1. Go to /admin
2. Click "Sign Out"
3. Wait 5 seconds
4. Go to /admin-login
5. Login again
```

---

## 🛠️ Permanent Fix: Update RLS Policies

To prevent this issue in the future, ensure your RLS policies allow users to update their own profiles:

```sql
-- Allow users to update their own profile
CREATE POLICY "Users can update own profile"
ON profiles
FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Allow users to insert their own role
CREATE POLICY "Users can insert own role"
ON user_roles
FOR INSERT
WITH CHECK (auth.uid() = user_id);
```

---

## 📋 Quick Reference: Make Any User Admin

**One-liner to make any user admin:**

```sql
-- Replace EMAIL with actual email
UPDATE profiles SET is_admin = true, role = 'admin' WHERE email = 'EMAIL';
INSERT INTO user_roles (user_id, role) SELECT id, 'admin' FROM profiles WHERE email = 'EMAIL' ON CONFLICT DO NOTHING;
```

---

## ✅ Success Checklist

After running the SQL, verify:

- [ ] SQL query executed without errors
- [ ] `is_admin = true` in profiles table
- [ ] `role = 'admin'` in profiles table
- [ ] Admin role exists in user_roles table
- [ ] Can login at `/admin-login`
- [ ] Redirects to `/admin` (not `/` or `/dashboard`)
- [ ] Can see admin sidebar
- [ ] Can access admin sections (Posts, Categories, etc.)
- [ ] No errors in browser console

---

## 🎯 Summary

**The Problem:**
- Admin users are not marked as admin in the production database
- They get logged in as regular members
- They cannot access the admin portal

**The Solution:**
1. Run SQL in Supabase to set `is_admin = true`
2. Add admin role to `user_roles` table
3. Logout and login again
4. Should now access `/admin` portal

**Why It Works Locally:**
- Local database has the admin role set correctly
- Production database doesn't have it set

**The Fix:**
- Manually set the admin role in production database
- This is a one-time fix per admin user

---

## 💡 Pro Tip

**Create a "Super Admin" SQL Script:**

Save this as a snippet in Supabase for quick admin creation:

```sql
-- Make user admin (replace EMAIL)
DO $$
DECLARE
  user_uuid UUID;
BEGIN
  -- Get user ID
  SELECT id INTO user_uuid FROM profiles WHERE email = 'EMAIL';
  
  -- Update profile
  UPDATE profiles 
  SET is_admin = true, role = 'admin' 
  WHERE id = user_uuid;
  
  -- Add role
  INSERT INTO user_roles (user_id, role)
  VALUES (user_uuid, 'admin')
  ON CONFLICT (user_id, role) DO NOTHING;
  
  -- Show result
  RAISE NOTICE 'User % is now admin', user_uuid;
END $$;
```

---

**This should fix your admin portal issue! 🚀**
