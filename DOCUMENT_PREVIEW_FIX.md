# Document Preview Fix - No Auto Download

## Problem
Jab client ya transporter "View Document" button click karte the, to document automatically download ho jata tha instead of browser mein preview hone ke.

## Solution
Updated `src/lib/document-url.ts` to always open documents in new tab for preview, no automatic download.

## Changes Made

### 1. Removed Auto-Download Logic
**Before:**
```typescript
// For raw files (download) - use anchor with original name
if (url.includes('/raw/upload/')) {
  const a = document.createElement('a')
  a.href = viewUrl
  a.download = originalName || 'document.pdf'
  a.target = '_blank'
  a.click()
  return
}
```

**After:**
```typescript
// Always open in new tab for preview (no automatic download)
window.open(viewUrl, '_blank')
```

### 2. Improved PDF Preview URL Generation
**Enhanced `getDocumentViewUrl()` function:**

```typescript
export function getDocumentViewUrl(url: string | undefined | null): string {
  if (!url) return '#'
  
  // Remove Cloudinary attachment mode (forces download)
  let cleanUrl = url.replace('/fl_attachment/', '/')
  
  // For PDFs in Cloudinary, optimize for browser preview
  if (cleanUrl.includes('/image/upload/') && cleanUrl.toLowerCase().includes('.pdf')) {
    // Add fl_attachment:false to prevent download
    cleanUrl = cleanUrl.replace('/image/upload/', '/image/upload/fl_attachment:false/')
  }
  
  // For raw uploads, convert to image upload for preview
  if (cleanUrl.includes('/raw/upload/') && cleanUrl.toLowerCase().includes('.pdf')) {
    cleanUrl = cleanUrl.replace('/raw/upload/', '/image/upload/fl_attachment:false/')
  }
  
  return cleanUrl
}
```

## How It Works Now

### Client & Transporter
1. Click "View Document" button
2. Document opens in **NEW TAB**
3. Browser shows **PDF PREVIEW**
4. User can:
   - View document in browser
   - Scroll through pages
   - Zoom in/out
   - Download manually if needed (browser's download button)

### Admin Panel
**NO CHANGES** - Admin functionality remains exactly the same.

## Cloudinary URL Transformations

### Before (Forced Download):
```
https://res.cloudinary.com/.../fl_attachment/image/upload/.../document.pdf
```

### After (Browser Preview):
```
https://res.cloudinary.com/.../image/upload/fl_attachment:false/.../document.pdf
```

### Key Parameter:
- `fl_attachment:false` - Tells Cloudinary to NOT set Content-Disposition: attachment header
- This allows browser to display PDF inline instead of downloading

## Benefits

✅ **Better UX** - Users can preview before downloading
✅ **Faster** - No unnecessary downloads
✅ **Consistent** - Same behavior across all document types
✅ **Mobile Friendly** - Works better on mobile browsers
✅ **Bandwidth Saving** - Only download if user wants to save

## Testing Checklist

### Client
- [ ] Click "View Document" on POD page
- [ ] PDF opens in new tab (no download)
- [ ] Can view PDF in browser
- [ ] Can manually download if needed

### Transporter
- [ ] Click "View Invoice" on invoices page
- [ ] PDF opens in new tab (no download)
- [ ] Can view PDF in browser
- [ ] Can manually download if needed

### Admin (Should NOT be affected)
- [ ] POD management - View Document works
- [ ] Transporter invoices - View Invoice works
- [ ] Client invoices - View Invoice works
- [ ] All admin functionality unchanged

## Files Modified

1. `src/lib/document-url.ts`
   - Removed auto-download logic
   - Improved PDF preview URL generation
   - Added `fl_attachment:false` parameter
   - Handles both `/image/upload/` and `/raw/upload/` URLs

## Notes

- Admin panel ko koi change nahi kiya
- Same `openDocument()` function use hota hai sab jagah
- Sirf behavior change kiya - preview instead of download
- User manually download kar sakta hai browser ke download button se
- Cloudinary URLs automatically optimized for preview
