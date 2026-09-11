# Maintenance Mode Troubleshooting Guide

## Problem: Maintenance Mode Not Staying Enabled

If your maintenance mode settings are not persisting when you try to enable them, follow this troubleshooting guide.

## Root Causes Fixed

1. **Race Conditions**: Real-time subscription interfered with save operations
2. **Database Query Issues**: `.single()` queries failed when no rows existed 
3. **Non-atomic Operations**: Check-then-update pattern created timing issues
4. **Missing Fixed Row**: No predictable row to update/query

## Solution Overview

The fixes implemented:

✅ **Atomic Upsert Operations**: Replaced check-then-update with single upsert operation  
✅ **Fixed Row ID**: Uses predictable UUID `00000000-0000-0000-0000-000000000001`  
✅ **Debounced Real-time Updates**: Prevents interference during save operations  
✅ **Better Error Handling**: Graceful fallbacks when database issues occur  
✅ **Enhanced Diagnostics**: Debug tools to identify and fix issues  

## Step-by-Step Fix Instructions

### Step 1: Run Database Fix Script

1. Open your **Supabase SQL Editor**
2. Copy and paste the contents of `FIX_MAINTENANCE_MODE.sql`
3. Click **Run** to execute the script
4. Check the output messages to confirm success

### Step 2: Test the Fix

1. Run the test script `TEST_MAINTENANCE_MODE.sql` in Supabase SQL Editor
2. Verify all tests pass and show expected results
3. Check that the fixed ID row exists

### Step 3: Use Debug Tools

1. Go to **Admin Panel** → **Maintenance Mode**
2. Click the **Debug** button
3. Review the diagnostic information:
   - ✅ **Table Exists**: Should show "Yes"
   - ✅ **Row Count**: Should be 1 or more
   - ✅ **Permissions**: Should include SELECT, UPDATE, FIXED_ID_EXISTS
   - ✅ **All Good**: Should show green success message

### Step 4: Test Maintenance Mode

1. In Admin Panel → Maintenance Mode:
   - Toggle **Enable Maintenance Mode** to ON
   - Add a custom message
   - Click **Save Settings**
   - Check for success toast message

2. Open your site in an **incognito/private browser window**
   - Should show maintenance page (not admin view)
   - Should display your custom message

3. Return to admin panel:
   - Toggle maintenance mode OFF
   - Click **Save Settings**
   - Refresh the incognito window
   - Should show normal site (not maintenance page)

## Technical Details

### What Changed:

**AdminMaintenance.tsx**:
- Replaced check-then-update with atomic upsert operation
- Uses fixed UUID for consistent row targeting
- Added 500ms delay before refetching to ensure database propagation

**PublicLayout.tsx**:
- Added debounced maintenance checks (300ms delay)
- Enhanced error handling with better logging
- Improved admin status verification

**Database Structure**:
- Ensures exactly one row exists with fixed ID
- Proper RLS policies for read/write access
- Clean conflict resolution for upserts

### Fixed ID Approach:

Instead of dynamic UUIDs, the system now uses:
```
ID: 00000000-0000-0000-0000-000000000001
```

This ensures:
- Predictable row to query/update
- No "row not found" errors
- Atomic upsert operations work correctly
- Real-time subscriptions target the right row

## Common Issues & Solutions

### Issue: "No rows returned" error
**Solution**: Run `FIX_MAINTENANCE_MODE.sql` to create the fixed row

### Issue: Changes not persisting
**Solution**: Check debug panel for permission issues or run fix script

### Issue: Admin can't access during maintenance
**Solution**: Verify user profile has `is_admin = true` or `role = 'admin'`

### Issue: Real-time updates not working  
**Solution**: Check browser console for subscription errors, refresh admin panel

## Files Modified

- `src/pages/admin/AdminMaintenance.tsx` - Fixed save logic with upsert
- `src/pages/PublicLayout.tsx` - Enhanced maintenance checking with debouncing
- `src/components/MaintenanceDebug.tsx` - Added fixed ID diagnostics
- `FIX_MAINTENANCE_MODE.sql` - Database setup with fixed row
- `TEST_MAINTENANCE_MODE.sql` - Verification script

## Verification Checklist

- [ ] Database fix script executed successfully
- [ ] Test script shows all tests passing  
- [ ] Debug panel shows "All Good" status
- [ ] Can enable maintenance mode in admin panel
- [ ] Incognito window shows maintenance page when enabled
- [ ] Can disable maintenance mode and site returns to normal
- [ ] Admin users can access site during maintenance mode
- [ ] Changes persist after browser refresh

## Support

If issues persist after following this guide:

1. Check browser console for JavaScript errors
2. Check Supabase logs for database errors  
3. Run the debug diagnostics and share results
4. Verify user permissions in profiles table
5. Test with different browsers/devices

The maintenance mode should now work reliably and persist settings correctly!