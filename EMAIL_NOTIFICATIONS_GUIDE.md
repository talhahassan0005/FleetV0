# FleetXChange Email Notifications Guide

## ✅ Complete Email Notification System

All email notifications have been implemented and are production-ready.

---

## 📧 Email Notifications Implemented

### 1. **Load Posted Notification**
**When:** Client posts a new load  
**Who Receives:** All verified TRANSPORTER users  
**Template:** Professional load card with route, price, and action button  
**File:** `/src/app/api/loads/route.ts` (POST method)

```javascript
// Line ~140: Sends loadPostedEmail to all verified transporters
for (const transporter of transporters) {
  if (transporter.email) {
    await sendEmail(transporter.email, `📬 New Load Available: ${ref}`, emailContent)
  }
}
```

**Email Sample:**
- Load Reference
- Route (Origin → Destination)
- Offered Price
- CTA: "View Available Loads" button

---

### 2. **Quote Received Notification**
**When:** Transporter submits a quote on a load  
**Who Receives:** Load owner (CLIENT)  
**Template:** Quote details with transporter info and price  
**File:** `/src/app/api/quotes/route.ts` (POST method)

```javascript
// Line ~50: Sends quoteReceivedEmail to client
const emailContent = quoteReceivedEmail(
  client.companyName,
  user?.companyName,
  load.ref,
  body.price,
  load.currency
)
await sendEmail(client.email, `📬 New Quote Received: ${load.ref}`, emailContent)
```

**Email Sample:**
- Transporter Name
- Load Reference
- Quoted Price (highlighted in green)
- CTA: "View Quotes" button

---

### 3. **Quote Approved Notification**
**When:** Client accepts a quote (quote status = ACCEPTED)  
**Who Receives:** Accepted transporter  
**What Also Happens:** 
- Load status changes to ASSIGNED
- All other quotes auto-rejected
- Auto-rejection emails sent to other transporters

**File:** `/src/app/api/quotes/[id]/route.ts` (PATCH method)

```javascript
// Line ~120: Sends quoteApprovedEmail to accepted transporter
if (status === 'ACCEPTED') {
  const emailContent = quoteApprovedEmail(
    transporter.companyName,
    loadRef
  )
  await sendEmail(transporter.email, `✅ Quote Approved: ${loadRef}`, emailContent)
}
```

**Email Sample:**
- Load Reference
- Assignment confirmation
- CTA: "View Assigned Loads" button

---

### 4. **Quote Rejected Notification**
**When:** Client explicitly rejects a quote OR quote auto-rejected (another accepted)  
**Who Receives:** Rejected transporter  
**Templates:** 
- `quoteRejectedEmail` for explicit rejection
- Bulk rejection for auto-rejected quotes

**File:** `/src/app/api/quotes/[id]/route.ts` (PATCH method)

```javascript
// Line ~155: Sends quoteRejectedEmail
if (status === 'REJECTED') {
  const emailContent = quoteRejectedEmail(transporterName, loadRef)
  await sendEmail(transporter.email, `❌ Quote Rejected: ${loadRef}`, emailContent)
}

// Line ~145-165: Handles auto-rejected quotes
if (status === 'ACCEPTED') {
  // ... reject all other quotes and send emails
  for (const rejQuote of rejectedQuotes) {
    await sendEmail(rejectedTransporter.email, `❌ Quote Rejected: ${loadRef}`, emailContent)
  }
}
```

**Email Sample:**
- Load Reference
- Rejection notice
- CTA: "View More Loads" button

---

### 5. **Document Approved Notification**
**When:** Admin approves a document (company registration, customs, POD, invoice, etc.)  
**Who Receives:** Document owner (CLIENT/TRANSPORTER)  
**File:** `/src/app/api/documents/[id]/approve/route.ts` (POST method)

```javascript
// Line ~55-65: Sends documentApprovedEmail
if (approved) {
  const emailContent = documentApprovedEmail(
    owner.companyName,
    updatedDocument.docType
  )
  await sendEmail(
    owner.email,
    `✅ Document Approved: ${updatedDocument.docType}`,
    emailContent
  )
}
```

**Email Sample:**
- Document Type
- Approval confirmation
- CTA: "Go to Dashboard" button

---

### 6. **Document Rejected Notification**
**When:** Admin rejects a document with reason  
**Who Receives:** Document owner (CLIENT/TRANSPORTER)  
**Includes:** Rejection reason for document resubmission  
**File:** `/src/app/api/documents/[id]/approve/route.ts` (POST method)

```javascript
// Line ~68-80: Sends documentRejectedEmail with reason
if (!approved) {
  const emailContent = documentRejectedEmail(
    owner.companyName,
    updatedDocument.docType,
    rejectionReason || 'Document does not meet our requirements'
  )
  await sendEmail(
    owner.email,
    `❌ Document Rejected: ${updatedDocument.docType}`,
    emailContent
  )
}
```

**Email Sample:**
- Document Type
- Rejection Reason (highlighted in red box)
- Instructions to resubmit
- CTA: "Upload Document" button

---

## 🔧 Configuration

### Environment Variables (`.env.local`)
```env
# Email Provider
MAIL_FROM="info.fleetx2026@gmail.com"
MAIL_HOST="smtp.gmail.com"
MAIL_PORT="587"
MAIL_USER="info.fleetx2026@gmail.com"
MAIL_PASS="yokjfmrojxulhyko"

# For email action links
NEXT_PUBLIC_SITE_URL="http://localhost:3004"

# OAuth fallback
OUTLOOK_EMAIL="info.fleetx2026@gmail.com"
OUTLOOK_PASSWORD="yokjfmrojxulhyko"
```

### Email Service
- **Provider:** Nodemailer + Gmail SMTP
- **Email Address:** info.fleetx2026@gmail.com
- **Authentication:** App-specific password (Gmail requirement)

---

## 📊 Email Flow Diagram

```
User Action                 → API Route          → Email Recipients
─────────────────────────────────────────────────────────────────────
1. Client posts load        → POST /api/loads    → All verified transporters
2. Transporter bids         → POST /api/quotes   → Client (load owner)
3. Client accepts quote     → PATCH /api/quotes  → Accepted transporter
4. Client rejects quote     → PATCH /api/quotes  → Rejected transporter(s)
5. Admin approves document  → POST /docs/[id]/approve → Document owner
6. Admin rejects document   → POST /docs/[id]/approve → Document owner
```

---

## 🧪 Testing Email Notifications

### Test 1: Load Posted Email
1. Login as CLIENT
2. Post a new load at `/client/post-load`
3. Check: All TRANSPORTER emails receive "New Load Available" email
4. Verify: Email contains route, price, and action button

### Test 2: Quote Received Email
1. Login as TRANSPORTER
2. Submit a quote on an available load
3. Check: CLIENT receives "New Quote Received" email
4. Verify: Email shows transporter name, quoted price

### Test 3: Quote Approved Email
1. Login as CLIENT
2. Accept a quote
3. Check: TRANSPORTER receives "Quote Approved" email
4. Verify: Email confirms load assignment

### Test 4: Quote Rejected Email
1. Login as CLIENT
2. Reject a quote (or post-accept to auto-reject others)
3. Check: TRANSPORTER receives "Quote Rejected" email
4. Verify: Email encourages to view more loads

### Test 5: Document Approved Email
1. Login as ADMIN
2. Go to verification documents
3. Approve a document
4. Check: Document owner receives "Document Approved" email
5. Verify: Email confirms approval and provides dashboard link

### Test 6: Document Rejected Email
1. Login as ADMIN
2. Reject a document with reason
3. Check: Document owner receives "Document Rejected" email
4. Verify: Email shows reason and reupload instructions

---

## 📋 Error Handling

All email failures are **logged but non-blocking**:
- ✅ Email send failure does NOT block the main operation
- ✅ Users can continue using the platform
- ⚠️ Email errors logged to console for debugging
- 📝 Sample error log: `[CreateLoad] ⚠️  Error sending load posted emails: {error}`

**Production Note:** Consider adding email audit table for retry mechanism.

---

## 🎨 Email Template Features

All templates include:
- ✅ Professional FleetXChange branding
- ✅ Clear subject lines with emojis for quick identification
- ✅ Responsive design (mobile-friendly)
- ✅ Action buttons with clear CTAs
- ✅ Company information personalization
- ✅ Relevant details (prices, references, reasons)
- ✅ Footer with FleetXChange branding

---

## 📝 Summary

| Notification | Status | Recipients | Trigger |
|---|---|---|---|
| Load Posted | ✅ Working | All Transporters | Client posts load |
| Quote Received | ✅ Working | Load Owner (Client) | Transporter submits quote |
| Quote Approved | ✅ Working | Accepted Transporter | Client accepts quote |
| Quote Rejected | ✅ Working | Rejected Transporter(s) | Client rejects quote |
| Document Approved | ✅ Working | Document Owner | Admin approves document |
| Document Rejected | ✅ Working | Document Owner | Admin rejects document |

**All email notifications are fully implemented and ready for production use!** 🚀
