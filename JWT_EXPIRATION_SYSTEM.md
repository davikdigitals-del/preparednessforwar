# JWT Expiration Auto-Logout System

## Overview

This system automatically handles JWT token expiration for both members and admins, providing a smooth user experience by automatically logging users out when their sessions expire and warning them beforehand.

## Features

### 🔄 **Automatic JWT Monitoring**
- Checks JWT expiration every 30 seconds
- Parses JWT tokens to get exact expiration time
- Monitors both member and admin sessions

### ⏰ **Early Warning System**
- Shows warning toast 5 minutes before expiration
- Displays session status in admin dashboard
- Visual indicators for session health

### 🔒 **Graceful Auto-Logout**
- Automatically logs out users when JWT expires
- Clears all session data and localStorage
- Redirects appropriately (admin → admin login, member → member login)
- Shows friendly explanation message

### 🔄 **Proactive Token Refresh**
- Attempts to refresh tokens before expiration
- Automatically refreshes 15 minutes before expiry (or halfway through session)
- Handles refresh failures gracefully

## Implementation

### Core Components

#### 1. **AuthContext Enhancement** (`src/contexts/AuthContext.tsx`)
```typescript
// Added JWT expiration checking
const checkJWTExpiration = async () => {
  // Parse JWT, check expiration, handle auto-logout
}

// Check every 30 seconds when user is signed in
setInterval(checkJWTExpiration, 30000)
```

#### 2. **JWT Expiration Hook** (`src/hooks/useJWTExpiration.tsx`)
```typescript
export function useJWTExpiration() {
  return {
    timeUntilExpiry: number | null,
    isExpiringSoon: boolean,
    isExpired: boolean
  }
}

export function SessionStatus() {
  // Visual component showing session status
}
```

#### 3. **JWT Refresh Handler** (`src/components/auth/JWTRefreshHandler.tsx`)
```typescript
// Proactively refreshes tokens before expiration
// Runs globally at app level
```

### UI Integration

#### **Admin Dashboard**
- Session status indicator in header
- Shows: 🟢 Active | ⏰ Expiring | 🔒 Expired
- Real-time countdown when expiring soon

#### **Member Dashboard**
- Session status in identity bar
- Same visual indicators as admin
- Integrated with existing user info

## User Experience

### **Expiration Timeline**

1. **🟢 Normal Operation**
   - JWT has >10 minutes remaining
   - No warnings shown
   - Automatic refresh attempts in background

2. **⏰ Warning Phase** (10-5 minutes remaining)
   - Visual indicator changes to amber
   - Shows countdown timer

3. **🚨 Critical Phase** (5 minutes remaining)
   - Toast warning shown: "Session expiring in 5 minutes"
   - Red indicators throughout UI
   - User advised to save work and refresh

4. **🔒 Expiration**
   - Automatic logout triggered
   - All session data cleared
   - Friendly message: "Your session has expired. Please log in again."
   - Redirect to appropriate login page

### **Different Logout Messages**

#### **Members:**
```
"Your session has expired. Please log in again."
→ Redirects to /login
```

#### **Admins:**
```
"Your session has expired. Please sign in again as an administrator."
→ Redirects to /admin/login
```

## Technical Details

### **JWT Parsing**
```typescript
const tokenPayload = JSON.parse(atob(session.access_token.split('.')[1]))
const expirationTime = tokenPayload.exp * 1000 // Convert to milliseconds
const timeUntilExpiry = expirationTime - Date.now()
```

### **Refresh Strategy**
- Refresh 15 minutes before expiration
- Minimum 5 minutes between refreshes
- Falls back to auto-logout if refresh fails

### **Security Considerations**
- Clears all localStorage on logout
- Removes admin status cache
- Prevents stale session persistence
- No sensitive data remains after logout

## Configuration

### **Timing Settings**
```typescript
const WARNING_TIME = 300000    // 5 minutes warning
const CHECK_INTERVAL = 30000   // Check every 30 seconds  
const REFRESH_TIME = 900000    // Refresh 15 min before expiry
```

### **Visual Indicators**
```typescript
🟢 Active:      timeUntilExpiry > 600000  (>10 min)
⏰ Expiring:    timeUntilExpiry <= 600000 (<10 min)
🔒 Expired:     timeUntilExpiry <= 0      (expired)
```

## Benefits

1. **🎯 Better UX** - No sudden auth errors, users are warned in advance
2. **🔒 Security** - Expired sessions are handled immediately  
3. **🔄 Automatic** - No manual intervention required
4. **📱 Universal** - Works for both members and admins
5. **⚡ Performant** - Minimal overhead, efficient checking

## Integration

The system is automatically enabled by including the `JWTRefreshHandler` component at the app level:

```typescript
// src/App.tsx
<AuthProvider>
  <JWTRefreshHandler />
  {/* rest of app */}
</AuthProvider>
```

Session status can be displayed anywhere using:

```typescript
import { SessionStatus } from '@/hooks/useJWTExpiration'

<SessionStatus /> // Shows visual indicator
```

## Error Handling

- **Parse Failures**: Gracefully ignored, continues normal auth flow
- **Network Issues**: Retries token refresh, falls back to logout
- **Invalid Tokens**: Immediate logout triggered
- **Clock Skew**: Uses server-provided expiration times

This system ensures users never encounter unexpected authentication errors and always have a smooth, predictable session experience.