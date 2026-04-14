# QuickBooks Integration Analysis & Plan

## 🎯 PROJECT OVERVIEW
**Goal:** Integrate QuickBooks Online for professional invoice creation, payment tracking, and financial management.

**Your Credentials:**
- Client ID: `AB0DMjJd5ByaC5WP6MiSinwY69wlWUhEESKRNOOX4q97Dfp97n`
- Client Secret: `Ir4JKYyUuriZWEVwHXhQljvFx2sMGAjtXpWcguzw`

---

## 📊 CURRENT SYSTEM ANALYSIS

### What's Already Built:
✅ Two-tier invoice system (Transporter + Client invoices)
✅ POD approval workflow (Admin → Client)
✅ Partial invoice system (handle tonnage tracking)
✅ Payment status tracking (UNPAID, PARTIAL_PAID, PAID)
✅ Email notifications to all parties
✅ Markup calculation (10% default)
✅ MongoDB-based invoice storage

### Current Invoice Flow:
```
1. Transporter uploads POD + Invoice
   ↓
2. Admin approves POD
   ↓
3. System creates TWO invoices:
   ├─ Transporter Invoice (amount from upload)
   └─ Client Invoice (transporter amount + 10% markup)
   ↓
4. Invoices stored in MongoDB
   ↓
5. Admin updates payment status manually
   ↓
6. Emails sent to transporter & client
```

---

## 🔄 PROPOSED QUICKBOOKS INTEGRATION FLOW

### New Invoice Flow:
```
1. Transporter uploads POD + Invoice
   ↓
2. Admin approves POD
   ↓
3. System creates in QuickBooks:
   ├─ BILL (from Transporter - vendor bill)
   └─ INVOICE (to Client with markup)
   ↓
4. Sync QB invoice to MongoDB (store QB_ID + status)
   ↓
5. Payment tracking via QuickBooks OR Manual
   ↓
6. Real-time sync: QB ← → MongoDB
```

---

## 🛠️ ARCHITECTURE CHANGES

### KEEP (Don't Remove):
```
✅ MongoDB documents collection (store PODs, invoice files)
✅ MongoDB invoices collection (store QB sync status & metadata)
✅ Email notification system (continue sending emails)
✅ Admin approval workflow (stays the same)
✅ Two-tier invoice system logic (keep markup calculation)
✅ Payment tracking permission model
✅ Client/Admin dashboard views
✅ API authentication structure
```

### REMOVE:
```
❌ MongoDB as primary invoice creation store
   → Move to QuickBooks API for creation
   
❌ Manual invoice number generation
   → Use QuickBooks's auto-numbering
```

### MODIFY:
```
🔄 /api/invoices/create-with-pods
   → Still accepts same data
   → Now sends to QuickBooks API
   → Returns QB Invoice ID back to MongoDB
   
🔄 /api/admin/invoices/[id]/payment-status
   → Can still update manually
   → OR fetch from QuickBooks if paid there
   
🔄 /api/client/loads-with-pods
   → Queries MongoDB + QB sync status
   → Shows QB invoice details
```

### ADD NEW:
```
➕ /lib/quickbooks.ts
   → QB authentication (OAuth 2.0)
   → QB API wrapper functions
   
➕ /api/quickbooks/auth/route.ts
   → OAuth callback handler
   
➕ /api/quickbooks/sync/route.ts
   → Sync QB data back to MongoDB
   
➕ /api/quickbooks/customers/sync/route.ts
   → Sync transporters & clients to QB
   
➕ Environment variables for QB tokens
```

---

## 📋 IMPLEMENTATION CHECKLIST

### Phase 1: Setup & Authentication (2-3 hours)
- [ ] Install QB dependency: `npm install qbo-api`
- [ ] Create `/lib/quickbooks.ts` for QB initialization
- [ ] Store QB tokens in environment variables
- [ ] Create OAuth callback route: `/api/quickbooks/auth/route.ts`
- [ ] Test QB connection with Sandbox account

### Phase 2: Sync Entities to QB (3-4 hours)
- [ ] Create Customers in QB (pull from users collection)
  - Clients → Customers (for invoices)
  - Transporters → Vendors (for bills)
- [ ] Create Chart of Accounts mapping
- [ ] Create Products/Services in QB
- [ ] Sync account structure with QB

### Phase 3: Invoice Creation Integration (4-5 hours)
- [ ] Modify `/api/invoices/create-with-pods` to:
  - Create Invoice in QB for client
  - Create Bill in QB for transporter payment tracking
  - Store QB IDs in MongoDB invoices collection
- [ ] Handle QB API errors gracefully
- [ ] Create backup: if QB fails, still create MB invoice locally
- [ ] Add QB invoice link to MongoDB records

### Phase 4: Payment Tracking Sync (3-4 hours)
- [ ] Create `/api/quickbooks/sync/route.ts`
  - Fetch payment status from QB
  - Update MongoDB when payment received
  - Send email notifications when paid
- [ ] Modify payment status endpoint to query QB first
- [ ] Implement sync schedule (every hour or on-demand)

### Phase 5: Client/Admin Dashboards (3-4 hours)
- [ ] Show QB invoice number in client dashboard
- [ ] Show QB hyperlink to full invoice view
- [ ] Display payment status from QB in admin dashboard
- [ ] Show QB invoice PDF download option

### Phase 6: Testing & Documentation (2-3 hours)
- [ ] Test end-to-end flow with sandbox
- [ ] Test payment sync functionality
- [ ] Document QB setup steps
- [ ] Create troubleshooting guide

---

## 💾 DATABASE CHANGES

### MongoDB - invoices collection (MODIFIED)
```json
{
  "_id": ObjectId,
  
  // Keep existing
  "loadId": ObjectId,
  "transporterId": ObjectId,
  "clientId": ObjectId,
  "invoiceType": "TRANSPORTER_INVOICE | CLIENT_INVOICE",
  "amount": Number,
  "status": String,
  "paymentStatus": "UNPAID | PARTIAL_PAID | PAID",
  
  // NEW: QuickBooks Sync
  "qb_sync": {
    "qbDocumentId": "123456789",      // From QB Invoice/Bill
    "qbDocumentType": "Invoice | Bill", // What we created in QB
    "qbDocumentNumber": "2024-001",    // QB's internal number
    "syncedAt": Date,
    "lastPaymentSync": Date,
    "qbPaymentStatus": "Unpaid | Partially Paid | Paid",
    "qbLink": "https://qb.intuit.com/..." // Direct QB link
  },
  
  "createdAt": Date,
  "updatedAt": Date
}
```

### No new collections needed!
- All QB data stored as nested `qb_sync` object
- Backward compatible with existing structure

---

## 🔐 QUICKBOOKS ENTITIES MAPPING

```
Your System          →  QuickBooks Entity
═════════════════════════════════════════
Transporter         →  Vendor
Client              →  Customer
Transporter Invoice →  Bill (Accounts Payable)
Client Invoice      →  Invoice (Accounts Receivable)
Load Amount         →  Line Item (Amount)
Load Reference      →  Invoice Description
Payment             →  Payment (automatically tracked)
```

---

## 📝 API ENDPOINT CHANGES

### 1. Invoice Creation (MODIFIED)
```
POST /api/invoices/create-with-pods
Request: Same as before
Response: Now includes QB IDs

{
  "transporter Invoice": {
    "_id": "...",
    "qbDocumentId": "123456",  // NEW
    "qbDocumentNumber": "2024-001"  // NEW
  },
  "clientInvoice": {
    "_id": "...",
    "qbDocumentId": "123457",  // NEW
    "qbDocumentNumber": "2024-002"  // NEW
  }
}
```

### 2. Payment Status (MODIFIED)
```
PATCH /api/admin/invoices/[id]/payment-status
Request: Same (or optionally sync from QB)
Response: 
{
  "status": "updated",
  "paymentStatus": "PAID",
  "qbPaymentStatus": "Paid",  // NEW - from QB
  "syncedAt": "2024-04-09T..."  // NEW
}
```

### 3. NEW: Sync QB to MongoDB
```
POST /api/quickbooks/sync
Purpose: Fetch latest payment status from QB and update MongoDB
Response:
{
  "invoicesSynced": 45,
  "paymentsFound": 12,
  "lastSync": "2024-04-09T..."
}
```

### 4. NEW: QB Auth Callback
```
GET /api/quickbooks/auth?code=...&realmId=...
Purpose: Handle OAuth callback after user authorizes QB
Response: Store tokens and redirect to success page
```

---

## 🚀 ENVIRONMENT VARIABLES TO ADD

```env
# QuickBooks OAuth
QB_CLIENT_ID=AB0DMjJd5ByaC5WP6MiSinwY69wlWUhEESKRNOOX4q97Dfp97n
QB_CLIENT_SECRET=Ir4JKYyUuriZWEVwHXhQljvFx2sMGAjtXpWcguzw
QB_REDIRECT_URI=http://localhost:3000/api/quickbooks/auth

# Stored after OAuth (Encrypted)
QB_ACCESS_TOKEN=...
QB_REFRESH_TOKEN=...
QB_REALM_ID=...
QB_TOKEN_EXPIRES_AT=...

# QB Settings
QB_SANDBOX_MODE=true  # While testing
QB_AUTO_SYNC_PAYMENT=true  # Auto sync payment status
QB_SYNC_INTERVAL=3600  # Seconds (1 hour)
```

---

## ⚖️ ADVANTAGES OF QB INTEGRATION

### ✅ For Your Business:
- Professional invoicing (branded QB template)
- Automatic payment remittance (bank sync)
- Real-time A/R dashboard
- Tax-ready financial reports
- Automatic invoice numbering & tracking
- Payment reminders (QB Batch Operations)
- Multi-currency support

### ✅ For Clients:
- QB invoice looks professional
- Can pay via QB directly
- Automatic receipt when paid
- No manual payment tracking needed

### ✅ For Admin:
- No manual invoice creation
- Real-time sync of payment status
- Integrated financial reporting
- Less data entry errors
- Automatic reconciliation

---

## ⚠️ TRADE-OFFS & CONSIDERATIONS

### Trade-off: Dependency on QB API
**Risk:** If QB API is down, invoices can't be created
**Mitigation:** Fall-back to MongoDB + async QB sync when QB unavailable

### Trade-off: Data Duplication
**Risk:** Invoice data stored in both QB and MongoDB
**Mitigation:** MongoDB acts as cache/sync point, QB is source

### Trade-off: Additional Costs
**Cost:** QB charges $25-$40/month per user
**Mitigation:** Optional feature - can keep local invoicing as backup

---

## 🔧 TECH STACK

### New Dependencies:
```json
{
  "qbo-api": "latest",           // QB API wrapper
  "axios": "latest",              // HTTP client
  "crypto": "built-in",           // For token encryption
  "@types/qbo-api": "latest"
}
```

### Implementation Languages:
- **Backend:** TypeScript/Node.js (existing)
- **QB SDK:** qbo-api library
- **Authentication:** OAuth 2.0 (built-in)

---

## 📅 ESTIMATED TIMELINE

```
Phase 1 (Setup)          → 2-3 hours
Phase 2 (Entity Sync)    → 3-4 hours
Phase 3 (Invoice Create) → 4-5 hours
Phase 4 (Payment Sync)   → 3-4 hours
Phase 5 (Dashboards)     → 3-4 hours
Phase 6 (Testing)        → 2-3 hours
═════════════════════════════════════
TOTAL                    → 17-23 hours (~2-3 days)
```

---

## 🎬 NEXT STEPS

1. **Review this plan** - Confirm direction
2. **Check QB Account** - Ensure admin has QB access
3. **Install QB Dependency** - `npm install qbo-api`
4. **Create OAuth endpoint** - Get QB tokens
5. **Build sync module** - `/lib/quickbooks.ts`
6. **Modify invoice creation** - Add QB integration
7. **Test end-to-end** - With sample invoice
8. **Deploy to production** - After testing

---

## ❓ KEY QUESTIONS TO ANSWER

1. **QB Sandbox or Live?** - Start in sandbox, move to live later?
2. **Auto-payment sync?** - Sync QB payments automatically every hour?
3. **Fallback plan?** - If QB fails, create local invoice backup?
4. **Invoice template?** - Use QB default or customize?
5. **Multi-currency?** - Support payments in ZAR, USD, etc.?

