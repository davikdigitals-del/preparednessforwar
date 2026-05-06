# Admin Login Lock Issue - Fixed

## Problem
Admin login/registration was failing with this error:
```
AbortError: Lock broken by another request with the 'steal' option
```

## Root Cause
The registration process was doing multiple auth operations too quickly:
1. `signUp()` - Create account
2. `signInWithPassword()` - Sign in immediately
3. Database updates - Set admin role
4. `signOut()` - Sign out

These operations were competing for the same auth lock, causing the "lock broken" error.

## Fix Applied

### Changed Registration Flow
**File:** `src/pages/AdminLoginPage.tsx`

**Before (broken):**
```typescript
// Sign up
await supabase.auth.signUp(...)

// Immediately sign in (causes lock contention!)
await supabase.auth.signInWithPassword(...)

// Update database
await supabase.from("profiles").upsert(...)

// Immediately sign out (more lock contention!)
await supabase.auth.signOut()
```

**After (fixed):**
```typescript
// Sign up and get user ID
const { data: signUpData } = await supabase.auth.signUp(...)
const userId = signUpData.user.id

// Wait for auth lock to release
await new Promise(resolve => setTimeout(resolve, 1000))

// Update database using the user ID (no additional auth needed)
await supabase.from("profiles").upsert({ id: userId, ... })

// Wait before signing out
await new Promise(resolve => setTimeout(resolve, 500))

// Sign out
await supabase.auth.signOut()

// Wait for signout to complete
await new Promise(resolve => setTimeout(resolve, 500))
```

### Key Changes:
1. ✅ Removed unnecessary `signInWithPassword()` call
2. ✅ Added delays between auth operations
3. ✅ Use user ID from signup response instead of signing in
4. ✅ Better error handling with error messages

## How to Test

### Test 1: Create New Admin Account

1. Go to: http://localhost:5173/admin-login
2. Click **"Create Account"** tab
3. Fill in:
   - Full Name: "Test Admin"
   - Email: "testadmin@example.com"
   - Password: "password123"
4. Complete reCAPTCHA (if enabled)
5. Click **"Create Admin Account"**
6. Wait for success message
7. Should see: "✅ Admin account created successfully! Please sign in below."
8. Login tab should auto-fill with your email/password
9. Click **"Login to Admin"**
10. Should redirect to `/admin` dashboard ✅

### Test 2: Login with Existing Account

1. Go to: http://localhost:5173/admin-login
2. Enter your email and password
3. Complete reCAPTCHA (if enabled)
4. Click **"Login to Admin"**
5. Should redirect to `/admin` dashboard ✅

## Other Errors Fixed

### reCAPTCHA Errors
The errors you saw:
```
Unchecked runtime.lastError: The message port closed before a response was received
SecurityError: Failed to read a named property 'a-1r4ikzq167zt' from 'Window'
```

These are **normal reCAPTCHA warnings** from Google's iframe. They don't affect functionality and can be ignored.

### Auth Lock Warnings
The warning:
```
Lock "lock:sb-xfbmpjgcfohewejdzlfw-auth-token" was not released within 5000ms
```

This was the main issue - now fixed with proper delays between operations.

## Files Modified

1. ✅ `src/pages/AdminLoginPage.tsx` - Fixed registration flow with delays
2. ✅ `ADMIN_LOGIN_LOCK_FIX.md` - This documentation

## Summary

**Problem:** Lock contention during admin registration  
**Cause:** Multiple auth operations happening too quickly  
**Solution:** Added delays and removed unnecessary sign-in step  
**Status:** ✅ Fixed - Ready to test

Try creating a new admin account now - it should work without errors!
