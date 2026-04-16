# Production-Only Bugs: Root Causes & Fixes

## 🐛 BUG 1: Client Approval Status shows "Rejected by client" (Should show "Pending")

### Root Cause
The displaying logic is **CORRECT**, but the **data in MongoDB is WRONG**. Two scenarios:

1. **Old Data Issue** (Most Likely): Invoices in production MongoDB have old `rejectionReason: "Rejected by client"` from previous rejected invoices, but status is stuck at PENDING
2. **Status Sync Issue**: Status fields in `invoices` collection aren't being updated when client approves/rejects

### Evidence
- API creation code (lines 185, 231): Correctly sets `clientApprovalStatus: 'PENDING_CLIENT_APPROVAL'`
- Rendering logic (lines 396-416): Correctly shows Pending/Approved/Rejected based on status
- **Problem**: MongoDB documents have wrong state

### Fix Strategy

#### Step 1: Check Data in Production (Debug Query)
Run this in MongoDB compass/shell to understand current data:

```javascript
// Check all invoices with PENDING status
db.getCollection('invoices').find({
  clientApprovalStatus: 'PENDING_CLIENT_APPROVAL'
}).limit(5).pretty()

// Find ones with rejection reason (this is the bug!)
db.getCollection('invoices').find({
  clientApprovalStatus: 'PENDING_CLIENT_APPROVAL',
  rejectionReason: { $exists: true, $ne: null }
}).count()
```

#### Step 2: Fix - Clear Invalid Rejection Reasons
If the query above returns results, fix them:

```javascript
// Clear rejectionReason for all PENDING invoices
db.getCollection('invoices').updateMany(
  {
    clientApprovalStatus: 'PENDING_CLIENT_APPROVAL',
    rejectionReason: { $exists: true, $ne: null }
  },
  {
    $set: { rejectionReason: null }
  }
)
```

#### Step 3: Code Fix - Add Data Validation
Add defensive check in `/src/app/api/admin/invoices/route.ts` (line 101 projection):

**File**: `src/app/api/admin/invoices/route.ts`

```typescript
// Around line 90-101, in the $project stage:

{
  $project: {
    _id: 1,
    invoiceNumber: 1,
    invoiceType: 1,
    amount: 1,
    currency: 1,
    paymentStatus: 1,
    paymentAmount: 1,
    paymentNotes: 1,
    paymentTrackedAt: 1,
    createdAt: 1,
    dueDate: 1,
    loadRef: '$load.ref',
    tonnage: '$tonnageForThisInvoice',
    progressPercentage: 1,
    clientName: '$client.name',
    clientEmail: '$client.email',
    transporterName: '$transporter.companyName',
    transporterEmail: '$transporter.email',
    podId: 1,
    linkedTransporterInvoiceId: 1,
    markupPercentage: 1,
    markupAmount: 1,
    qbLink: 1,
    qbInvoiceId: 1,
    clientApprovalStatus: 1,
    // FIX: Clear rejection reason if status is PENDING
    rejectionReason: {
      $cond: [
        { $eq: ['$clientApprovalStatus', 'PENDING_CLIENT_APPROVAL'] },
        null,  // Return null for pending invoices
        '$rejectionReason'  // Keep original for others
      ]
    }
  }
}
```

---

## 🐛 BUG 2: QB Link Button DISABLED (Shows "No QB Link")

### Root Cause Analysis

The button rendering is conditional on `invoice.qbLink` existing:
```jsx
{invoice.qbLink && <a href={invoice.qbLink}>QB</a>}
```

If `qbLink` is null/undefined, button doesn't show. **Problem**: qbLink is not being saved in production.

### Possible Root Causes (by likelihood)

#### 1. **QB Credentials Not Set on Vercel** (MOST LIKELY)
Vercel environment variables missing:
- `QUICKBOOKS_REALM_ID` ← Required for your production QB account
- `QUICKBOOKS_CLIENT_ID` / `QUICKBOOKS_CLIENT_SECRET` might be SANDBOX credentials instead of PRODUCTION

**Check on Vercel dashboard**:
Settings → Environment Variables → Should have:
```
QUICKBOOKS_REALM_ID=123456789  (Your actual production QB realm ID)
QUICKBOOKS_CLIENT_ID=production_client_id
QUICKBOOKS_CLIENT_SECRET=production_client_secret
QUICKBOOKS_ENVIRONMENT=PRODUCTION
```

#### 2. **QB Invoice Creation Failing** (Secondary)
The QB invoice is being created but qbLink isn't generated/saved.

### Evidence Trail
1. **QB Link Generation** (`src/lib/quickbooks.ts` lines 35-45):
   - `generateQBInvoiceLink(invoiceId)` - Creates URL like `https://qbo.intuit.com/app/invoice?txnId=123`
   - Uses `getQBDashboardURL()` which checks `QB_ENVIRONMENT`

2. **QB Link Saving** (`src/app/api/invoices/create-with-pods/route.ts` lines 463, 476):
   ```typescript
   qbLink: generateQBInvoiceLink(qbInvoice.invoiceId)
   qbLink: generateQBBillLink(qbBill.billId)
   ```
   - These ARE being saved to invoices collection

3. **QB Link Retrieval** (`src/app/api/admin/invoices/route.ts` line 101):
   ```typescript
   qbLink: 1  // Is being returned from API
   ```

### Fix Checklist

#### ✅ Step 1: Verify Vercel Environment Variables
1. Go to Vercel dashboard → Your project
2. Settings → Environment Variables
3. **ADD/VERIFY** these variables:

```env
# If using PRODUCTION QB (not sandbox)
QUICKBOOKS_ENVIRONMENT=PRODUCTION

# Replace these with your PRODUCTION quarterback credentials
QUICKBOOKS_CLIENT_ID=<YOUR_PRODUCTION_CLIENT_ID>
QUICKBOOKS_CLIENT_SECRET=<YOUR_PRODUCTION_CLIENT_SECRET>
QUICKBOOKS_REALM_ID=<YOUR_PRODUCTION_REALM_ID>
QUICKBOOKS_REDIRECT_URI=https://fleet-v0.vercel.app/api/quickbooks/auth
```

**⚠️ CRITICAL**: Get the PRODUCTION realm ID from your QB account (not sandbox!)

#### ✅ Step 2: Add Debug Logging
Add logging to see what's happening:

**File**: `src/app/api/invoices/create-with-pods/route.ts`

Around line 445-470, add after QB invoice creation:

```typescript
    console.log('[Invoice] 🔗 QB Link Generation Debug:', {
      environment: process.env.QUICKBOOKS_ENVIRONMENT,
      qbInvoiceId: qbInvoice?.invoiceId,
      qbBillId: qbBill?.billId,
      generatedInvoiceLink: qbInvoiceLink,
      generatedBillLink: qbBillLink,
      realmId: process.env.QUICKBOOKS_REALM_ID ? 'SET' : 'MISSING'
    });
```

#### ✅ Step 3: Add Null Check for qbLink
Ensure qbLink isn't being accidentally set to null:

**File**: `src/app/api/invoices/create-with-pods/route.ts`

Around lines 463, 476:

```typescript
// For transporter invoice
{
  // ... other fields ...
  qbLink: qbInvoiceLink  // Make sure this isn't null
    ? generateQBInvoiceLink(qbInvoice.invoiceId)
    : null,
  // ... rest of invoice ...
}

// For client invoice
{
  // ... other fields ...
  qbLink: qbBillLink
    ? generateQBBillLink(qbBill.billId)
    : null,
  // ... rest of invoice ...
}
```

#### ✅ Step 4: Alternative - Fetch qbLink from QB if Missing
If invoices were created without qbLinks, add recovery logic:

**File**: `src/app/api/admin/invoices/route.ts`

In the aggregation pipeline, after getting invoices, add a post-processing step:

```typescript
// After the aggregation, before .toArray()
{
  $addFields: {
    // Use fallback if qbLink missing but qbInvoiceId exists
    qbLink: {
      $cond: [
        { $and: [
          { $eq: ['$qbLink', null] },
          { $ne: ['$qbInvoiceId', null] }
        ]},
        {
          $concat: [
            process.env.QUICKBOOKS_ENVIRONMENT === 'PRODUCTION'
              ? 'https://qbo.intuit.com'
              : 'https://app.sandbox.qbo.intuit.com',
            '/app/invoice?txnId=',
            { $toString: '$qbInvoiceId' }
          ]
        },
        '$qbLink'
      ]
    }
  }
}
```

---

## 🔧 Implementation Order

1. **BUG 1 (Data Fix)** - Run MongoDB query to understand state
2. **BUG 2 (Config Fix)** - Verify/add Vercel environment variables
3. **Deploy** with debug logging additions
4. **Test** - Create new invoices and check:
   - ✅ New invoices show "Pending" status (not "Rejected")
   - ✅ QB button appears with valid link
5. **Monitor** Vercel logs for error messages

---

## 📊 Testing Queries

### Check Invoice Status Distribution
```javascript
db.getCollection('invoices').aggregate([
  {
    $group: {
      _id: '$clientApprovalStatus',
      count: { $sum: 1 },
      withReason: {
        $sum: {
          $cond: [
            { $and: [
              { $eq: ['$rejectionReason', { $exists: true }] },
              { $ne: ['$rejectionReason', null] }
            ]},
            1,
            0
          ]
        }
      }
    }
  }
])
```

### Check QB Link Status
```javascript
db.getCollection('invoices').aggregate([
  {
    $group: {
      _id: {
        hasQBLink: { $cond: [{ $eq: ['$qbLink', null] }, false, true] },
        invoiceType: '$invoiceType'
      },
      count: { $sum: 1 }
    }
  }
])
```

### Show Problematic Invoices
```javascript
// Invoices with PENDING status BUT have rejection reason
db.getCollection('invoices').find({
  clientApprovalStatus: 'PENDING_CLIENT_APPROVAL',
  rejectionReason: { $ne: null }
}).project({
  invoiceNumber: 1,
  clientApprovalStatus: 1,
  rejectionReason: 1,
  qbLink: 1,
  createdAt: 1
}).sort({ createdAt: -1 }).limit(5)
```

