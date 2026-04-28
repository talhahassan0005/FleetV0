# Debug Guide - Token Not Found

## Problem
```
[getTokenData] ❌ Token not found in cookies
```

## Check 1: Cookies Mein Token Hai?

### Browser Console Mein Type Karo:
```javascript
document.cookie
```

**Expected Output**:
```
"next-auth.session-token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Agar nahi dikha**, toh NextAuth cookie set nahi kar raha!

## Check 2: Application Tab

1. **DevTools → Application tab**
2. **Cookies → http://localhost:3000**
3. **Check**: `next-auth.session-token` hai?

**Agar nahi hai**, problem hai!

## Check 3: Network Tab - Login Request

1. **Network tab kholo**
2. **Login karo**
3. **Check**: `POST /api/auth/callback/credentials`
4. **Response Headers** mein dekho: `Set-Cookie` header hai?

**Expected**:
```
Set-Cookie: next-auth.session-token=...; Path=/; HttpOnly; SameSite=Lax
```

## Solution Options

### Option 1: Use Fallback (Already Implemented)
```typescript
// Sidebar now uses fallback
const tokenData = getTokenData()  // Try JWT first
const companyName = tokenData?.companyName || session?.user?.companyName  // Fallback to session
```

**Result**: Works even if JWT token not found!

### Option 2: Fix NextAuth Cookie (If needed)

Check `src/lib/auth.ts`:
```typescript
export const authOptions: NextAuthOptions = {
  // ...
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production'
      }
    }
  }
}
```

## Current Status

✅ **Fallback implemented** - Sidebar will work with or without JWT token
✅ **Session API call** - Only happens once on initial load
✅ **No blink** - Role from URL, company name from session (already loaded)

## Test Now

1. Login karo
2. Check console: `[getTokenData]` log
3. Check sidebar: Company name dikha?
4. Navigate to "All Loads": Blink nahi hona chahiye!

**Batao kya dikha?** 🤔
