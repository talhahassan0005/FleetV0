# Document View Issue - Debugging Guide

## Issue
Client aur Transporter portal mein "View Document" click karne se document view nahi ho raha.
Admin portal mein properly work kar raha hai.

## Check Karo

### 1. Browser Console
Client/Transporter portal mein document view click karo aur console dekho:
- Koi error dikha?
- Network tab mein `/api/documents/[id]/view` request ka status kya hai?
  - 401 = Unauthorized (session issue)
  - 403 = Forbidden (authorization issue)
  - 404 = Not found (document ID issue)
  - 500 = Server error

### 2. Server Logs
Terminal mein yeh logs dikhne chahiye:
```
[ViewDocument] Session check: { hasSession: true, userId: '...', userRole: 'CLIENT', docId: '...' }
[ViewDocument] Document found: { ... }
[ViewDocument] Access granted: { isOwner: true, isAdmin: false, userRole: 'CLIENT' }
```

**Agar nahi dikha**, toh problem hai!

### 3. Test Cases

#### Test 1: Client viewing own document
1. Client portal → Documents
2. Click "View Document" on own uploaded document
3. **Expected**: Document opens in new tab
4. **If fails**: Check console for error

#### Test 2: Client viewing transporter document
1. Client portal → Documents → Transporter Documents section
2. Click "View Document"
3. **Expected**: Document opens
4. **If fails**: Authorization issue

#### Test 3: Transporter viewing own document
1. Transporter portal → Documents
2. Click "View Document"
3. **Expected**: Document opens
4. **If fails**: Check console

## Common Issues

### Issue 1: Session Not Found (401)
**Cause**: SessionProvider removed, session nahi mil raha
**Fix**: SessionProvider wapas add kiya hai with refetch disabled

### Issue 2: Document ID undefined
**Cause**: `doc._id` properly pass nahi ho raha
**Fix**: Check karo link mein ID hai ya nahi

### Issue 3: Authorization Failed (403)
**Cause**: Role check fail ho raha
**Fix**: Check authorization logic in API route

## Quick Test

Browser console mein paste karo:
```javascript
// Check if link is correct
const links = document.querySelectorAll('a[href*="/api/documents/"]')
console.log('Document links:', Array.from(links).map(l => l.href))

// Test API call
fetch('/api/documents/YOUR_DOC_ID/view')
  .then(r => console.log('Status:', r.status, r.ok))
  .catch(e => console.error('Error:', e))
```

## Batao
1. Console mein kya error dikha?
2. Network tab mein status code kya hai?
3. Server logs mein kya dikha?
