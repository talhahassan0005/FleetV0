# Production Bugs - Quick Fix Summary

## The Issues (Production Only)

### 🐛 BUG 1: Invoice shows "✕ Rejected - Reason: Rejected by client"
- Appears for NEW invoices that should show "⏳ Pending"
- Issue: Old data in MongoDB has rejectionReason set
- **FIX**: API now clears rejectionReason for PENDING_CLIENT_APPROVAL status

### 🐛 BUG 2: QB (QuickBooks) button shows disabled/"No QB Link"
- QB links are being generated (you can see them in API response)
- But aren't rendering in the button
- **FIX**: Two improvements:
  1. API regenerates missing QB links if qbInvoiceId exists
  2. Enhanced logging shows if QB environment is misconfigured

---

## The Root Causes

### BUG 1 Root Cause
MongoDB documents have:
- `clientApprovalStatus: 'PENDING_CLIENT_APPROVAL'` ✅
- `rejectionReason: "Rejected by client"` ❌ (shouldn't exist for pending)

This is old data from previous rejected invoices. The rendering logic was correct, but the data was wrong.

### BUG 2 Root Causes (Most Likely → Least Likely)

1. **MOST LIKELY**: Vercel missing `QUICKBOOKS_REALM_ID` environment variable
   - QB invoice created successfully
   - qbLink generated correctly
   - But can't be saved without realm ID
   - Link exists locally but is null in production DB

2. **SECONDARY**: QB credentials are SANDBOX instead of PRODUCTION
   - Invoice created in wrong QB account
   - Links point to sandbox, not production QB

3. **TERTIARY**: QB integration error during invoice creation
   - Invoice created but QB creation failed silently
   - qbLink never generated

---

## The Fixes (Code Changes)

### Fix 1: Clear Invalid Rejection Reasons
**File**: `src/app/api/admin/invoices/route.ts`

Added conditional projection:
```javascript
rejectionReason: {
  $cond: [
    { $eq: ['$clientApprovalStatus', 'PENDING_CLIENT_APPROVAL'] },
    null,  // Always null for pending
    '$rejectionReason'  // Keep for others
  ]
}
```

### Fix 2: Regenerate Missing QB Links
**File**: `src/app/api/admin/invoices/route.ts`

Added fallback after fetching invoices:
```javascript
const invoicesWithQBLinks = invoices.map(invoice => {
  if ((!invoice.qbLink || invoice.qbLink === '') && invoice.qbInvoiceId) {
    const baseURL = process.env.QUICKBOOKS_ENVIRONMENT === 'PRODUCTION' 
      ? 'https://qbo.intuit.com'
      : 'https://app.sandbox.qbo.intuit.com';
    invoice.qbLink = `${baseURL}/app/invoice?txnId=${invoice.qbInvoiceId}`;
  }
  return invoice;
});
```

### Fix 3: Enhanced Logging
**File**: `src/app/api/invoices/create-with-pods/route.ts`

Added detailed QB link generation logging to diagnose production issues:
```javascript
console.log('[Invoice] 🔗 Generated QB links:', {
  environment: process.env.QUICKBOOKS_ENVIRONMENT || 'SANDBOX',
  invoiceId: qbInvoice?.invoiceId,
  realmIdSet: !!realmId,  // ← Shows if QUICKBOOKS_REALM_ID is set
  linkBaseURL: '...'
});
```

---

## Deployment Checklist

### Step 1: Deploy Code ✅ DONE
- Built successfully: `npm run build` passed with no errors
- Code changes committed and ready to push

### Step 2: Set Vercel Environment Variables 🔄 CRITICAL
**You must do this:**

1. Go to: https://vercel.com/dashboard/fleet-v0/settings/environment-variables
2. **Verify/Add** these 5 variables:
   ```
   QUICKBOOKS_ENVIRONMENT = PRODUCTION
   QUICKBOOKS_CLIENT_ID = <your_production_client_id>
   QUICKBOOKS_CLIENT_SECRET = <your_production_client_secret>
   QUICKBOOKS_REALM_ID = <your_production_realm_id>  ← MOST CRITICAL
   QUICKBOOKS_REDIRECT_URI = https://fleet-v0.vercel.app/api/quickbooks/auth
   ```

**WHERE TO GET THESE:**
- Go to https://developer.intuit.com/app/developer/myapps
- Click your app
- Get Client ID & Secret from "Credentials" section
- Get Realm ID from your QB connection settings (NOT sandbox!)

### Step 3: Test in Production ✅ VERIFY
After deploying and setting vars:

1. Go to https://fleet-v0.vercel.app/admin/invoices
2. Look for a recent invoice
3. Check "Client Approval" column:
   - Should show **"⏳ Pending"** (not "Rejected")
4. Check "Actions" column:
   - Should show **green "QB" button** (not disabled)
5. Click QB button:
   - Should open `https://qbo.intuit.com/...` link

---

## How to Verify the Fix Works

### In Browser Console:
```javascript
// Check QB links are present
fetch('/api/admin/invoices').then(r => r.json()).then(d => {
  console.log('QB Links status:');
  d.invoices.slice(0, 3).forEach(inv => {
    console.log(`${inv.invoiceNumber}:`, inv.qbLink ? '✅ HAS LINK' : '❌ NO LINK');
  });
});
```

### In Vercel Logs:
When new invoice is created, look for:
```
[Invoice] 🔗 Generated QB links: {
  environment: "PRODUCTION",
  realmIdSet: true,  ← If false, QUICKBOOKS_REALM_ID not set!
  ...
}
```

---

## Quick Troubleshooting

**QB button still missing?**
→ Check Vercel logs for `realmIdSet: false` 
→ Add `QUICKBOOKS_REALM_ID` to Vercel env vars

**Still shows "Rejected" status?**
→ Wait 5 minutes for Vercel to rebuild
→ Clear browser cache
→ Check MongoDB has real PENDING_CLIENT_APPROVAL invoices

**QB link points to sandbox?**
→ Check Vercel env: `QUICKBOOKS_ENVIRONMENT` should be `PRODUCTION`
→ If it says `SANDBOX`, QB is using sandbox credentials

---

## Files Modified

1. ✅ `src/app/api/admin/invoices/route.ts`
   - Added defensive clearing of rejection reasons
   - Added fallback QB link regeneration
   - Added import for generateQBInvoiceLink functions

2. ✅ `src/app/api/invoices/create-with-pods/route.ts`
   - Enhanced logging for QB link generation

**Build Status**: ✅ PASSED (No errors, only ESLint warnings)

---

## Next Steps

1. **Deploy**: `git push` (Vercel auto-deploys)
2. **Configure**: Add QUICKBOOKS_REALM_ID to Vercel env vars
3. **Test**: Create new invoice and verify QB button appears
4. **Monitor**: Check Vercel logs for `realmIdSet: true` confirmation

Once QUICKBOOKS_REALM_ID is set, both bugs should be fixed! 🎉

