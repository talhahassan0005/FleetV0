# Invoice System Redesign - Implementation Plan

## Current Problem
The system generates both transporter and client invoices simultaneously when admin creates an invoice. This doesn't match the real-world workflow where:
1. Transporter submits their invoice for admin review
2. Admin reviews and approves transporter invoice
3. Admin uploads client invoice PDF from QuickBooks
4. Client receives downloadable PDF invoice

## Required Changes

### 1. Transporter Invoice Flow

**Step 1: Transporter Creates Invoice**
- Transporter uploads their invoice document (PDF)
- Transporter enters invoice details:
  - Invoice number
  - Amount
  - Tonnage delivered
  - Notes
- Status: `PENDING_ADMIN_REVIEW`

**Step 2: Admin Reviews Transporter Invoice**
- Admin sees pending transporter invoices in admin portal
- Admin can:
  - View uploaded invoice PDF
  - Approve invoice → Status: `APPROVED`
  - Reject invoice with reason → Status: `REJECTED`
- If rejected, transporter can resubmit

**Step 3: Admin Creates Client Invoice**
- After approving transporter invoice
- Admin uploads client invoice PDF from QuickBooks
- Admin enters:
  - QuickBooks invoice number
  - Amount (with markup)
  - Notes
- Status: `PENDING_SEND`

**Step 4: Admin Sends Client Invoice**
- Admin reviews client invoice
- Admin clicks "Send to Client"
- Client receives email with downloadable PDF
- Status: `SENT`

### 2. Database Schema Changes

```typescript
// Transporter Invoice Collection
{
  _id: ObjectId,
  loadId: ObjectId,
  transporterId: ObjectId,
  podId: ObjectId,
  
  // Invoice details
  invoiceNumber: string,
  amount: number,
  currency: string,
  tonnage: number,
  
  // Document
  invoicePdfUrl: string,
  invoicePdfName: string,
  
  // Status tracking
  status: 'PENDING_ADMIN_REVIEW' | 'APPROVED' | 'REJECTED',
  rejectionReason?: string,
  
  // Timestamps
  submittedAt: Date,
  reviewedAt?: Date,
  reviewedBy?: ObjectId,
  
  notes?: string
}

// Client Invoice Collection
{
  _id: ObjectId,
  loadId: ObjectId,
  clientId: ObjectId,
  transporterInvoiceId: ObjectId, // Link to transporter invoice
  
  // QuickBooks details
  quickbooksInvoiceNumber: string,
  quickbooksInvoicePdfUrl: string,
  quickbooksInvoicePdfName: string,
  
  // Amounts
  amount: number,
  currency: string,
  tonnage: number,
  
  // Status tracking
  status: 'PENDING_SEND' | 'SENT' | 'PAID',
  
  // Payment tracking
  paymentStatus: 'UNPAID' | 'PARTIALLY_PAID' | 'PAID',
  paymentDate?: Date,
  paymentNotes?: string,
  
  // Timestamps
  createdAt: Date,
  sentAt?: Date,
  sentBy?: ObjectId,
  
  notes?: string
}
```

### 3. API Endpoints to Create/Modify

#### Transporter APIs
- `POST /api/transporter/invoices` - Submit invoice
- `GET /api/transporter/invoices` - View my invoices
- `GET /api/transporter/invoices/[id]` - View specific invoice

#### Admin APIs
- `GET /api/admin/transporter-invoices` - List pending transporter invoices
- `GET /api/admin/transporter-invoices/[id]` - View transporter invoice details
- `PATCH /api/admin/transporter-invoices/[id]/approve` - Approve transporter invoice
- `PATCH /api/admin/transporter-invoices/[id]/reject` - Reject transporter invoice

- `POST /api/admin/client-invoices` - Create client invoice (upload QuickBooks PDF)
- `GET /api/admin/client-invoices` - List client invoices
- `POST /api/admin/client-invoices/[id]/send` - Send invoice to client
- `PATCH /api/admin/client-invoices/[id]/payment-status` - Update payment status

#### Client APIs
- `GET /api/client/invoices` - View my invoices
- `GET /api/client/invoices/[id]` - View specific invoice
- `GET /api/client/invoices/[id]/download` - Download invoice PDF

### 4. UI Pages to Create/Modify

#### Transporter Portal
- **New Page:** `/transporter/invoices/create` - Submit invoice form
- **Modify:** `/transporter/invoices` - Show invoice status (pending, approved, rejected)

#### Admin Portal
- **New Page:** `/admin/transporter-invoices` - Review pending transporter invoices
- **New Page:** `/admin/transporter-invoices/[id]` - Review specific invoice
- **New Page:** `/admin/client-invoices/create` - Upload QuickBooks invoice
- **Modify:** `/admin/invoices` - Separate tabs for transporter & client invoices

#### Client Portal
- **Modify:** `/client/invoices` - Show invoices with download button
- **New Feature:** PDF download functionality

### 5. Email Notifications

**Transporter Invoice Submitted:**
- To: Admin
- Subject: "New Transporter Invoice Submitted - [Load Ref]"

**Transporter Invoice Approved:**
- To: Transporter
- Subject: "Invoice Approved - [Invoice Number]"

**Transporter Invoice Rejected:**
- To: Transporter
- Subject: "Invoice Rejected - [Invoice Number]"
- Include: Rejection reason

**Client Invoice Sent:**
- To: Client
- Subject: "Invoice from FleetXChange - [Invoice Number]"
- Attachment: PDF invoice

### 6. Implementation Steps

1. ✅ Fix contact form email issue
2. Create new database collections (transporter_invoices, client_invoices)
3. Create transporter invoice submission API
4. Create admin review APIs (approve/reject)
5. Create client invoice upload API
6. Build transporter invoice submission UI
7. Build admin review UI
8. Build client invoice upload UI
9. Add PDF download functionality for clients
10. Implement email notifications
11. Test complete flow end-to-end
12. Migrate existing invoices (if any)

### 7. Benefits of New System

✅ **Proper Workflow:** Matches real-world business process
✅ **Admin Control:** Admin reviews all transporter invoices before processing
✅ **QuickBooks Integration:** Admin uploads official invoices from QuickBooks
✅ **Client Experience:** Clients get downloadable PDF invoices
✅ **Audit Trail:** Clear tracking of invoice status and approvals
✅ **Flexibility:** Admin can reject and request corrections

## Next Steps

Would you like me to:
1. Start implementing the transporter invoice submission flow?
2. Create the admin review interface first?
3. Build the complete system in phases?

Let me know which approach you prefer!
