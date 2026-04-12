# QuickBooks Integration - Setup Guide

> 🚀 **Status**: Phase 1 Complete - Ready for OAuth Setup
> 
> **Files Created**:
> - ✅ `/src/lib/quickbooks.ts` - QB SDK & API wrapper
> - ✅ `/src/app/api/quickbooks/auth/route.ts` - OAuth callback handler
> - ✅ `/src/app/api/quickbooks/customers/sync/route.ts` - User sync endpoint
> - ✅ `/src/app/api/quickbooks/sync/route.ts` - Payment sync endpoint
> - ✅ Updated User schema with QB fields
> - ✅ Updated Invoice schema with `qb_sync` fields
> - ✅ Updated `.env.local` with QB credentials placeholder

---

## 📋 STEP 1: Get QB Credentials

### 1.1 Create QB Developer Account
1. Go to https://developer.intuit.com/
2. Sign up with your Intuit account (or create one)
3. Verify your email

### 1.2 Create an App
1. Click **"Create an app"**
2. Select **"QuickBooks Online"**
3. Select **"Accounting"** as the API
4. Name your app: `FleetXChange`
5. Click **"Create"**

### 1.3 Get Credentials
In your app settings, find:
- **Client ID** (copy to `.env.local`)
- **Client Secret** (copy to `.env.local`)

### 1.4 Configure Redirect URI
1. Go to **Settings** → **Keys & OAuth**
2. Under **Redirect URIs**, add:
   ```
   http://localhost:3004/api/quickbooks/auth
   ```
3. Save Changes

### 1.5 Update .env.local
```bash
QUICKBOOKS_CLIENT_ID="YOUR_QB_CLIENT_ID_HERE"
QUICKBOOKS_CLIENT_SECRET="YOUR_QB_CLIENT_SECRET_HERE"
QUICKBOOKS_REDIRECT_URI="http://localhost:3004/api/quickbooks/auth"
QUICKBOOKS_ENVIRONMENT="SANDBOX"
```

---

## 📲 STEP 2: Test OAuth Connection

### 2.1 Start Development Server
```bash
npm run dev
```

### 2.2 Initialize QB Connection (Admin Only)
Visit: `http://localhost:3004/api/quickbooks/auth?action=connect`

**What happens**:
1. Redirects to QB login page
2. You approve app access
3. Redirects back to `/api/quickbooks/auth?code=...&realmId=...`
4. System stores QB tokens in database

### 2.3 Verify Connection
Check MongoDB:
```javascript
db.users.findOne({ role: 'ADMIN' })
// Should show:
// quickbooks: {
//   isConnected: true,
//   realmId: "1234567890",
//   accessToken: "...",
//   refreshToken: "...",
//   tokenExpiresAt: ISODate(...)
// }
```

✅ **If you see this, OAuth is working!**

---

## 👥 STEP 3: Sync Users to QB

### 3.1 Call Sync Endpoint (Admin Only)
```bash
curl -X POST http://localhost:3004/api/quickbooks/customers/sync \
  -H "Content-Type: application/json"
```

Or via API client (Postman):
```
POST /api/quickbooks/customers/sync
```

### 3.2 Response Example
```json
{
  "success": true,
  "message": "User sync completed",
  "results": {
    "clientsCreated": 5,
    "clientsFailed": 0,
    "transportersCreated": 3,
    "transportersFailed": 0,
    "errors": []
  }
}
```

### 3.3 Verify in QB
1. Log into QB (https://qbo.intuit.com/)
2. Go to **Customers** → Should see all your clients
3. Go to **Vendors** → Should see all your transporters

✅ **If you see synced data, user sync is working!**

---

## 🧾 STEP 4: Modify Invoice Creation

### 4.1 Update Invoice Creation Endpoint
Now modify `/src/app/api/invoices/create-with-pods/route.ts`:

```typescript
import { createQBCustomer, createQBVendor, createQBInvoice, createQBBill } from '@/lib/quickbooks';

// After POD approval, in the invoice creation function:

// Get admin with QB connection
const admin = await User.findOne({ role: 'ADMIN' });

if (admin?.quickbooks?.isConnected) {
  const accessToken = admin.quickbooks.accessToken;
  const realmId = admin.quickbooks.realmId;

  // Create QB Invoice (for client)
  const qbInvoice = await createQBInvoice(
    accessToken,
    realmId,
    {
      customerId: client.quickbooks.customerId,
      customerDisplayName: client.companyName,
      lineItems: [{
        description: `Load ${load.ref} - Tonnage: ${tonnage}`,
        amount: clientAmount
      }],
      invoiceNumber: clientInvoiceNumber,
      memo: `Load Ref: ${load.ref}`,
    }
  );

  // Create QB Bill (for transporter)
  const qbBill = await createQBBill(
    accessToken,
    realmId,
    {
      vendorId: transporter.quickbooks.vendorId,
      vendorDisplayName: transporter.companyName,
      lineItems: [{
        description: `Load ${load.ref} - Tonnage: ${tonnage}`,
        amount: transporterAmount
      }],
      billNumber: transporterInvoiceNumber,
    }
  );

  // Save QB IDs to MongoDB
  await Invoice.updateOne(
    { _id: invoiceId },
    {
      $set: {
        'qb_sync.invoiceId': qbInvoice.invoiceId,
        'qb_sync.invoiceSyncToken': qbInvoice.syncToken,
        'qb_sync.billId': qbBill.billId,
        'qb_sync.billSyncToken': qbBill.syncToken,
        'qb_sync.createdAt': new Date(),
      }
    }
  );

  // QB Invoice link (to be added to email)
  const qbInvoiceLink = `https://qbo.intuit.com/app/invoice/${qbInvoice.invoiceId}`;
}
```

---

## 🔄 STEP 5: Auto-Sync Payments

### 5.1 Create Cron Job
Install `node-cron`:
```bash
npm install node-cron
```

### 5.2 Create Sync Job
Create `/src/jobs/quickbooks-sync.ts`:
```typescript
import cron from 'node-cron';
import { fetch } from 'node-fetch';

// Run payment sync every hour
cron.schedule('0 * * * *', async () => {
  console.log('🔄 Syncing QB payments...');
  
  try {
    const response = await fetch(
      'http://localhost:3004/api/quickbooks/sync',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      }
    );
    
    const result = await response.json();
    console.log('✅ QB sync completed:', result.results);
  } catch (error) {
    console.error('❌ QB sync failed:', error);
  }
});
```

### 5.3 Initialize in App
In `/src/app/layout.tsx` or `/src/lib/db.ts`:
```typescript
import '@/jobs/quickbooks-sync';
```

---

## 🧪 STEP 6: Test End-to-End Flow

### 6.1 Prerequisites
1. ✅ QB OAuth connected
2. ✅ Users synced to QB
3. ✅ Invoice creation modified with QB API calls

### 6.2 Test Flow
1. **Upload POD**: Transporter uploads POD file
2. **Approve POD**: Admin approves → QB Invoice + Bill created
3. **Check QB**: Log into QB → Should see Invoice & Bill
4. **Sync Payments**: Run payment sync → Status updates in MongoDB
5. **Client View**: Client sees invoice in dashboard

---

## 📊 API Endpoints Reference

### OAuth
- `GET /api/quickbooks/auth?action=connect` - Start OAuth
- `GET /api/quickbooks/auth?code=...&realmId=...&state=...` - OAuth callback
- `POST /api/quickbooks/auth` - Disconnect or refresh token

### Sync
- `POST /api/quickbooks/customers/sync` - Sync users to QB
- `GET /api/quickbooks/customers/sync` - Get sync status
- `POST /api/quickbooks/sync` - Sync payments from QB
- `GET /api/quickbooks/sync` - Get payment sync status

---

## 🐛 Troubleshooting

### "QB not connected"
**Problem**: Getting `QB not connected` error
**Solution**: 
1. Go to `http://localhost:3004/api/quickbooks/auth?action=connect`
2. Complete OAuth flow
3. Check MongoDB for `quickbooks.isConnected = true`

### "Invalid redirect URI"
**Problem**: Getting OAuth error about redirect URI
**Solution**:
1. Go to QB Developer Portal
2. Check Redirect URI matches exactly: `http://localhost:3004/api/quickbooks/auth`
3. Check `.env.local` has same URI

### "Customer already exists"
**Problem**: Sync endpoint returns customer exists error
**Solution**: Already synced! Run sync endpoint again - it checks for existing customers first.

### "Token expired"
**Problem**: Getting `token expired` error
**Solution**: 
1. Admin calls `POST /api/quickbooks/auth` with `action=refresh-token`
2. New access token is generated
3. Automatic refresh happens after 1 hour

---

## ✅ Verification Checklist

After completing all steps:

- [ ] `.env.local` has QB credentials
- [ ] OAuth connection works (admin can connect)
- [ ] Users synced to QB (visible in QB app)
- [ ] QB Invoice created when POD approved
- [ ] QB Bill created when POD approved
- [ ] Payment status syncs back to MongoDB
- [ ] Client sees QB invoice link in dashboard
- [ ] Email includes QB invoice link

---

## 🚀 Next Steps

1. **Complete OAuth Setup** → Get QB credentials and log file output
2. **Sync Users** → Run sync endpoint and verify in QB
3. **Modify Invoice Creation** → Update `/api/invoices/create-with-pods/route.ts`
4. **Test with Sample Data** → Create test invoice and check QB
5. **Setup Cron Job** → Auto-sync payments every hour
6. **Go Live** → Switch to PRODUCTION environment

---

## 📞 Support

If you encounter issues:
1. Check console logs for error details
2. Verify `.env.local` has correct QB credentials
3. Check MongoDB for `users.quickbooks` data
4. Check QB Developer Portal for API errors

**Common Issues**: 
- Make sure QB app is in SANDBOX for testing
- Use same email for QB login as admin account
- Allow pop-ups when redirecting to QB login

