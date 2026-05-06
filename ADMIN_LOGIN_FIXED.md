# Admin Login & Registration - Fixed

## What Was Fixed

### 1. **Better Error Handling**
- Added try-catch blocks
- More detailed console logging
- Better error messages for users

### 2. **Login Function**
```typescript
// Now with detailed logging
console.log("Attempting admin login for:", email);
console.log("Admin login successful, user role:", built.role);
```

### 3. **Registration Function**
```typescript
// Step-by-step logging
console.log("Creating admin account...");
console.log("Account created, signing in...");
console.log("Setting admin role...");
console.log("Registration complete!");
```

### 4. **Success Message**
After registration:
```
✅ Admin account created successfully! Please sign in below.
```

## How to Use

### Create Admin Account
1. Go to `/admin-login`
2. Click "Create Account" tab
3. Fill in:
   - Full Name
   - Admin Email
   - Password (min 6 characters)
4. Complete reCAPTCHA (if enabled)
5. Click "Create Admin Account"
6. Wait for success message
7. Switch to "Login" tab (automatic)
8. Sign in with your credentials

### Login as Admin
1. Go to `/admin-login`
2. "Login" tab (default)
3. Enter:
   - Admin Email
   - Password
4. Complete reCAPTCHA (if enabled)
5. Click "Login to Admin"
6. Redirected to `/admin` dashboard

## Troubleshooting

### Check Browser Console
Open browser console (F12) to see detailed logs:

```
Attempting admin login for: admin@example.com
Admin login - User authenticated: abc-123-def
Admin profile updated successfully
Admin role updated successfully
Admin login successful, user role: admin isAdmin: true
Admin login successful, navigating to /admin
```

### Common Issues

**Issue 1: "Invalid admin credentials"**
- Check email and password are correct
- Make sure account exists (create one first)

**Issue 2: "Please complete reCAPTCHA"**
- Complete the reCAPTCHA verification
- Or disable reCAPTCHA in `.env` file

**Issue 3: Database errors**
- Check Supabase connection
- Check RLS policies allow admin operations
- Check `profiles` and `user_roles` tables exist

## Database Requirements

### Tables Needed
1. **profiles** table with columns:
   - id (uuid)
   - email (text)
   - name (text)
   - country (text)
   - is_admin (boolean)
   - role (text)

2. **user_roles** table with columns:
   - user_id (uuid)
   - role (text)
   - created_at (timestamp)

### RLS Policies
Make sure these policies exist:

```sql
-- Allow users to insert their own profile
CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Allow users to insert their own role
CREATE POLICY "Users can insert own role" ON user_roles
  FOR INSERT WITH CHECK (auth.uid() = user_id);
```

## Testing

### Test Registration
1. Open `/admin-login`
2. Click "Create Account"
3. Enter test data:
   - Name: Test Admin
   - Email: test@example.com
   - Password: test123
4. Click "Create Admin Account"
5. Check console for logs
6. Should see success message
7. Should switch to Login tab

### Test Login
1. Enter credentials from registration
2. Click "Login to Admin"
3. Check console for logs
4. Should redirect to `/admin`
5. Should see admin dashboard

## Console Logs to Expect

### Successful Registration
```
Creating admin account for: test@example.com
Account created, signing in to set admin role...
Signed in, setting admin role...
Admin role set, signing out...
Registration complete, switched to login tab
```

### Successful Login
```
Attempting admin login for: test@example.com
Admin login - User authenticated: abc-123-def-456
Admin profile updated successfully
Admin role updated successfully
Admin login successful, user role: admin isAdmin: true
Admin login successful, navigating to /admin
```

## Summary

✅ **Fixed:**
- Better error handling
- Detailed console logging
- Clear success messages
- Step-by-step feedback

✅ **Now you can:**
- Create admin accounts
- Login as admin
- See what's happening in console
- Debug issues easily

Check the browser console (F12) to see detailed logs and identify any issues!
