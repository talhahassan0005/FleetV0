# Production Bug Fixes - Deployment & Testing Guide

## ✅ Code Changes Completed

### BUG 1 FIX: Client Approval Status Showing "Rejected"
**File**: `src/app/api/admin/invoices/route.ts`

**Change**: Added defensive logic in MongoDB aggregation projection to clear `rejectionReason` for invoices with `clientApprovalStatus = 'PENDING_CLIENT_APPROVAL'`

```javascript
// In $project stage:
rejectionReason: {
  $cond: [
    { $eq: ['$clientApprovalStatus', 'PENDING_CLIENT_APPROVAL'] },
    null,  // Pending invoices should never show rejection reason
    '$rejectionReason'
  ]
}
```

**Impact**: NEW invoices will always show "Pending" badge, even if old data is corrupted

---

### BUG 2 FIX: QB Link Button Showing Disabled
**Files Modified**:

1. **`src/app/api/admin/invoices/route.ts`** (Added 2 improvements)
   - Added import: `import { generateQBInvoiceLink, generateQBBillLink } from '@/lib/quickbooks'`
   - Added `export const dynamic = 'force-dynamic'` for real-time data
   - Added fallback logic to regenerate QB links if missing:
   ```javascript
   // After retrieving invoices, regenerate missing links
   const invoicesWithQBLinks = invoices.map(invoice => {
     if ((!invoice.qbLink || invoice.qbLink === '') && invoice.qbInvoiceId) {
       const isProduction = process.env.QUICKBOOKS_ENVIRONMENT === 'PRODUCTION';
       const baseURL = isProduction 
         ? 'https://qbo.intuit.com'
         : 'https://app.sandbox.qbo.intuit.com';
       invoice.qbLink = `${baseURL}/app/invoice?txnId=${invoice.qbInvoiceId}`;
     }
     return invoice;
   });
   ```

2. **`src/app/api/invoices/create-with-pods/route.ts`** (Enhanced logging)
   - Improved QB link generation logging to help debug production issues:
   ```javascript
   console.log('[Invoice] 🔗 Generated QB links:', {
     environment: process.env.QUICKBOOKS_ENVIRONMENT || 'SANDBOX',
     invoiceId: qbInvoice?.invoiceId,
     billId: qbBill?.billId,
     invoiceLink: qbInvoiceLink,
     billLink: qbBillLink,
     realmIdSet: !!realmId,
     linkBaseURL: process.env.QUICKBOOKS_ENVIRONMENT === 'PRODUCTION' 
       ? 'https://qbo.intuit.com' 
       : 'https://app.sandbox.qbo.intuit.com'
   });
   ```

**Impact**: 
- Invoices without qbLink will automatically regenerate it IF qbInvoiceId exists
- Production logs will show which QB environment is being used
- Helps diagnose if QB credential issues are causing missing links

---

## 🚀 Deployment Steps

### Step 1: Deploy Code to Vercel
```bash
# Commit changes
git add src/app/api/admin/invoices/route.ts src/app/api/invoices/create-with-pods/route.ts
git commit -m "Fix: Production-only bugs - QB links and invoice approval status

- BUG 1: Clear invalid rejection reasons for pending invoices
- BUG 2: Auto-regenerate QB links if missing but ID exists
- Add enhanced logging for QB link generation debugging
- Verify environment is correctly set in Vercel"

git push
```

Vercel will automatically deploy on push. Check deployment in Vercel dashboard → Deployments.

### Step 2: Verify Vercel Environment Variables (CRITICAL FOR BUG 2)

Go to Vercel Dashboard:
1. Select your `fleet-v0.vercel.app` project
2. Settings → Environment Variables
3. **VERIFY** these are present and correct:

```env
# QuickBooks Production Configuration
QUICKBOOKS_ENVIRONMENT=PRODUCTION
QUICKBOOKS_CLIENT_ID=<your_production_client_id>
QUICKBOOKS_CLIENT_SECRET=<your_production_client_secret>
QUICKBOOKS_REALM_ID=<your_production_realm_id>
QUICKBOOKS_REDIRECT_URI=https://fleet-v0.vercel.app/api/quickbooks/auth
MONGO_URL=<your_mongo_connection>
DATABASE_URL=<your_mongo_connection>
```

**⚠️ IMPORTANT**: 
- `QUICKBOOKS_REALM_ID` must be your PRODUCTION realm ID (from your QB account, not sandbox)
- If missing, QB link generation will fail silently and return null

### Step 3: Test Bug Fixes in Production

#### Test BUG 1 (Approval Status)

1. Open https://fleet-v0.vercel.app/admin/invoices
2. Look at "Client Approval" column
3. **Expected**: 
   - New invoices should show "⏳ Pending" (yellow badge)
   - Invoices show red "Rejected" ONLY if client actually rejected them
4. **Verify**: Create a new invoice and check:
   ```javascript
   // Run in browser console on /admin/invoices page
   fetch('/api/admin/invoices').then(r => r.json()).then(d => {
     const newInvoices = d.invoices.slice(0, 3);
     newInvoices.forEach(inv => {
       console.log(`${inv.invoiceNumber}: status=${inv.clientApprovalStatus}, reason=${inv.rejectionReason}`);
     });
   });
   ```

#### Test BUG 2 (QB Link Button)

1. Open https://fleet-v0.vercel.app/admin/invoices
2. Create a new invoice (or find recent one)
3. Look at "Actions" column
4. **Expected**: Green "QB" button should appear with clickable link
5. **Test Steps**:
   - Click "QB" button
   - Should open QuickBooks invoice in `https://qbo.intuit.com/...` (production) or sandbox link
   - If button is missing → Check Vercel logs for errors

### Step 4: Monitor Vercel Logs

Vercel Deployments → Select deployment → "Logs" tab

Look for these log messages from invoice creation:
```
[Invoice] 🔗 Generated QB links: {
  environment: "PRODUCTION",
  invoiceId: "123",
  billId: "456",
  invoiceLink: "https://qbo.intuit.com/app/invoice?txnId=123",
  billLink: "https://qbo.intuit.com/app/bill?txnId=456",
  realmIdSet: true,
  linkBaseURL: "https://qbo.intuit.com"
}
```

If you see:
```
realmIdSet: false
```
→ **PROBLEM**: `QUICKBOOKS_REALM_ID` not set on Vercel → Add it immediately!

---

## 🔍 Debugging Guide (If Issues Persist)

### Problem: QB Links Still Missing in Production

**Check 1**: Verify invoices are being created with qbLink
```javascript
// In MongoDB Compass, run on 'invoices' collection:
db.invoices.find({ createdAt: { $gte: new Date(ISODate().getTime() - 3600000) } })
  .project({ invoiceNumber: 1, qbLink: 1, qbInvoiceId: 1 })
  .limit(5)
```

Expected: `qbLink` should have value like `"https://qbo.intuit.com/app/invoice?txnId=..."`

If `qbLink` is null but `qbInvoiceId` exists:
- QB invoice was created but link wasn't saved
- The fallback in admin API should regenerate it
- Check if fallback log appears: `[AdminInvoices] 🔗 Regenerated QB link`

**Check 2**: Verify Vercel environment variables are being read
```
In browser console after navigating to admin page:
fetch('/api/admin/invoices').then(r => r.json()).then(d => {
  console.log('Sample QB links:', d.invoices.slice(0, 2).map(i => ({
    num: i.invoiceNumber,
    link: i.qbLink
  })));
});
```

If qbLinks are empty or sandbox URLs (but you want production):
- Environment variable `QUICKBOOKS_ENVIRONMENT=PRODUCTION` not set
- Go to Vercel Settings and verify

---

## 📊 Data Cleanup (One-Time, Optional)

If you need to clean old corrupted data in production MongoDB:

```javascript
// Clear rejectionReason for pending invoices (one-time fix)
db.invoices.updateMany(
  {
    clientApprovalStatus: 'PENDING_CLIENT_APPROVAL',
    rejectionReason: { $exists: true, $ne: null }
  },
  {
    $set: { rejectionReason: null }
  }
)

// Result: Updated X documents

// Verify fix
db.invoices.countDocuments({
  clientApprovalStatus: 'PENDING_CLIENT_APPROVAL',
  rejectionReason: { $ne: null }
})

// Result: 0 (should be zero now)
```

---

## ✅ Verification Checklist

After deployment, confirm all items:

- [ ] Code deployed to Vercel (check Deployments page)
- [ ] Build succeeded (no errors in deployment)
- [ ] `QUICKBOOKS_ENVIRONMENT=PRODUCTION` set on Vercel
- [ ] `QUICKBOOKS_REALM_ID` set on Vercel (not empty)
- [ ] Create test invoice and verify:
  - [ ] Invoice shows in /admin/invoices page
  - [ ] "Client Approval" column shows "⏳ Pending" badge
  - [ ] "QB" button appears in Actions column
  - [ ] QB button link works (opens QuickBooks)
- [ ] Check Vercel logs for success messages:
  - [ ] `[Invoice] 🔗 Generated QB links` with realmIdSet: true
  - [ ] `[AdminInvoices] ✅ Retrieved invoices`
  - [ ] No `❌ QB credential lookup error` messages

---

## 📞 Troubleshooting Quick Reference

| Problem | Root Cause | Solution |
|---------|-----------|----------|
| QB button missing | qbLink is null | Check QUICKBOOKS_REALM_ID on Vercel |
| QB button opens sandbox URL | QUICKBOOKS_ENVIRONMENT not set to PRODUCTION | Update Vercel env var |
| Status shows "Rejected" wrongly | Old data with rejectionReason | Fallback logic clears it; if persists, run cleanup query |
| No login appears in logs | QB credentials missing | Add all QUICKBOOKS_* env vars to Vercel |
| Build failed | Type errors | Check `npm run build` output locally first |

---

## 🎯 Expected Outcome

**Before Fix** (Local vs Production):
- Local: ✅ Works (has sandbox QB creds)
- Production: ❌ QB button missing, wrong approval status

**After Fix** (Both environments):
- Local: ✅ Works (SANDBOX environment)
- Production: ✅ Works (PRODUCTION environment + real QB links)

Both environments now:
- Display correct approval status (Pending/Approved/Rejected)
- Show QB link button for invoices
- Auto-regenerate missing QB links if qbInvoiceId exists

