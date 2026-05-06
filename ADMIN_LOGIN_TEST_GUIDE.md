# Admin Login & Registration - Testing Guide

## Current Status
✅ Code is ready and enhanced with detailed logging
✅ Database setup script is prepared
⏳ **NEXT STEP**: Run database setup and test

---

## Step 1: Run Database Setup

### Option A: Run the Complete Setup Script
1. Open Supabase Dashboard: https://supabase.com/dashboard
2. Go to your project: **PREPAREDNESS FOR WAR**
3. Click **SQL Editor** in left sidebar
4. Click **New Query**
5. Copy and paste the entire contents of `database/SETUP_ADMIN_TABLES.sql`
6. Click **Run** button
7. Check for success messages in the results panel

### Option B: Quick Verification (Check if already set up)
1. Open Supabase Dashboard SQL Editor
2. Run this query:
```sql
-- Check if tables and columns exist
SELECT 
  'profiles.is_admin' as check_item,
  CASE WHEN EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'is_admin'
  ) THEN '✅ EXISTS' ELSE '❌ MISSING' END as status
UNION ALL
SELECT 
  'profiles.role' as check_item,
  CASE WHEN EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'role'
  ) THEN '✅ EXISTS' ELSE '❌ MISSING' END as status
UNION ALL
SELECT 
  'user_roles table' as check_item,
  CASE WHEN EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_name = 'user_roles'
  ) THEN '✅ EXISTS' ELSE '❌ MISSING' END as status;
```

If you see any ❌ MISSING, run the full setup script from Option A.

---

## Step 2: Test Admin Registration

### 2.1 Open Admin Login Page
1. Start your development server: `npm run dev`
2. Open browser: http://localhost:8080/admin-login
3. Open browser console: Press **F12** → Click **Console** tab

### 2.2 Create Admin Account
1. Click **"Create Account"** tab
2. Fill in the form:
   - **Full Name**: Test Admin
   - **Admin Email**: admin@test.com
   - **Password**: test123456
3. Complete reCAPTCHA (if enabled)
4. Click **"Create Admin Account"** button

### 2.3 Watch Console Logs
You should see these logs in order:
```
Creating admin account for: admin@test.com
Account created, signing in to set admin role...
Signed in, setting admin role...
Admin role set, signing out...
Registration complete, switched to login tab
```

### 2.4 Check for Success
- ✅ Success message appears: "✅ Admin account created successfully! Please sign in below."
- ✅ Form automatically switches to "Login" tab
- ✅ Email and password are pre-filled

---

## Step 3: Test Admin Login

### 3.1 Login with New Account
1. Make sure you're on the **"Login"** tab
2. Email should be pre-filled: admin@test.com
3. Password should be pre-filled: test123456
4. Complete reCAPTCHA (if enabled)
5. Click **"Login to Admin"** button

### 3.2 Watch Console Logs
You should see these logs:
```
Attempting admin login for: admin@test.com
Admin login - User authenticated: [user-id]
Admin profile updated successfully
Admin role updated successfully
Admin login successful, user role: admin isAdmin: true
Admin login successful, navigating to /admin
```

### 3.3 Check for Success
- ✅ No error messages
- ✅ Browser redirects to `/admin` dashboard
- ✅ You see the admin panel with sidebar navigation
- ✅ Header shows your name and admin menu

---

## Step 4: Verify Admin Access

### 4.1 Check Admin Dashboard
After successful login, you should see:
- ✅ Admin sidebar with sections:
  - Dashboard
  - Posts
  - Sections
  - Categories
  - Subscriptions
  - Members
  - Settings
- ✅ Your name in the header
- ✅ Logout button works

### 4.2 Test Admin Features
1. Click **"Posts"** in sidebar
2. You should see the posts management page
3. Try creating a new post
4. Check if all fields work (title, author, section, category, etc.)

---

## Troubleshooting

### Issue 1: "Invalid admin credentials"
**Symptoms**: Login fails with error message

**Solutions**:
1. Check email and password are correct
2. Make sure you created the account first (use "Create Account" tab)
3. Check console for detailed error logs
4. Verify database setup was run successfully

### Issue 2: Registration fails silently
**Symptoms**: No success message, no error, nothing happens

**Solutions**:
1. Check browser console for errors
2. Verify Supabase connection in `.env` file:
   ```
   VITE_SUPABASE_URL=https://xfbmpjgcfohewejdzlfw.supabase.co
   VITE_SUPABASE_ANON_KEY=[your-key]
   ```
3. Check Supabase dashboard for authentication settings
4. Make sure email confirmation is disabled (for testing)

### Issue 3: "Please complete reCAPTCHA"
**Symptoms**: Can't submit form without reCAPTCHA

**Solutions**:
1. Complete the reCAPTCHA verification
2. OR disable reCAPTCHA temporarily:
   - Open `.env` file
   - Remove or comment out: `VITE_RECAPTCHA_SITE_KEY=...`
   - Restart dev server

### Issue 4: Redirects to login after accessing /admin
**Symptoms**: Can't access admin panel, keeps redirecting

**Solutions**:
1. Check if you're actually logged in (check console logs)
2. Verify `is_admin` flag is set in database:
   ```sql
   SELECT id, email, name, is_admin, role 
   FROM profiles 
   WHERE email = 'admin@test.com';
   ```
3. Should show `is_admin = true` and `role = 'admin'`
4. If not, run the setup script again

### Issue 5: Database permission errors
**Symptoms**: Console shows "permission denied" or "RLS policy violation"

**Solutions**:
1. Run the database setup script: `database/SETUP_ADMIN_TABLES.sql`
2. Check RLS policies in Supabase dashboard:
   - Go to **Database** → **Tables** → **profiles**
   - Click **RLS Policies** tab
   - Should see policies for INSERT and UPDATE
3. If policies are missing, run setup script again

---

## Console Log Reference

### Successful Registration Flow
```javascript
// Step 1: Start registration
"Creating admin account for: admin@test.com"

// Step 2: Account created in auth.users
"Account created, signing in to set admin role..."

// Step 3: Sign in to set admin flags
"Signed in, setting admin role..."

// Step 4: Admin flags set in database
"Admin role set, signing out..."

// Step 5: Complete
"Registration complete, switched to login tab"
```

### Successful Login Flow
```javascript
// Step 1: Start login
"Attempting admin login for: admin@test.com"

// Step 2: Authentication successful
"Admin login - User authenticated: abc-123-def-456"

// Step 3: Update profile
"Admin profile updated successfully"

// Step 4: Update role
"Admin role updated successfully"

// Step 5: Build user object
"Admin login successful, user role: admin isAdmin: true"

// Step 6: Navigate
"Admin login successful, navigating to /admin"
```

---

## Quick Test Checklist

Use this checklist to verify everything works:

### Database Setup
- [ ] Ran `database/SETUP_ADMIN_TABLES.sql` in Supabase SQL Editor
- [ ] Verified `profiles` table has `is_admin` and `role` columns
- [ ] Verified `user_roles` table exists
- [ ] Checked RLS policies are created

### Registration Test
- [ ] Opened `/admin-login` page
- [ ] Opened browser console (F12)
- [ ] Clicked "Create Account" tab
- [ ] Filled in form with test data
- [ ] Clicked "Create Admin Account"
- [ ] Saw console logs for each step
- [ ] Saw success message
- [ ] Form switched to "Login" tab

### Login Test
- [ ] Email and password pre-filled
- [ ] Clicked "Login to Admin"
- [ ] Saw console logs for each step
- [ ] Redirected to `/admin` dashboard
- [ ] Can see admin sidebar
- [ ] Can access admin features

### Admin Access Test
- [ ] Can view posts page
- [ ] Can create new post
- [ ] Can view sections page
- [ ] Can logout successfully
- [ ] After logout, can't access `/admin` without login

---

## Next Steps After Testing

Once everything works:

1. **Create your real admin account**:
   - Use your real email
   - Use a strong password
   - Save credentials securely

2. **Disable test account** (optional):
   ```sql
   DELETE FROM profiles WHERE email = 'admin@test.com';
   ```

3. **Enable email confirmation** (optional):
   - Go to Supabase Dashboard
   - Authentication → Settings
   - Enable "Confirm email"

4. **Configure reCAPTCHA** (recommended):
   - Get keys from Google reCAPTCHA
   - Add to `.env` file
   - Restart server

---

## Summary

✅ **Code is ready** - All enhancements are in place
✅ **Database script is ready** - Just needs to be run
✅ **Detailed logging** - Easy to debug issues
✅ **Clear error messages** - Users know what went wrong

**Your task**: Run the database setup script and test the registration/login flow!

Check the browser console (F12) for detailed logs at every step.
