# Invoice Client Approval Feature - Implementation Summary

## Overview
Added client approval/rejection functionality for invoices with mandatory rejection reason. The approval status is now reflected across all portals (Client, Admin, Transporter).

## Changes Made

### 1. New API Endpoint
**File**: `src/app/api/invoices/[invoiceId]/client-approval/route.ts`
- **Method**: POST
- **Access**: CLIENT role only
- **Actions**: APPROVE or REJECT
- **Features**:
  - Validates client ownership of invoice
  - Mandatory rejection reason for REJECT action
  - Updates invoice `clientApprovalStatus` field
  - Syncs status with related POD documents
  - Clears rejection reason on approval

### 2. Client Portal Updates
**File**: `src/app/client/invoices/page.tsx`

#### POD Management Tab:
- **View Button Fix**: Changed from modal to direct link opening in new tab
  - Before: `<button onClick={() => setViewingUrl(invoice.fileUrl)}>View</button>`
  - After: `<a href={invoice.fileUrl} target="_blank">View</a>`
- **Actions**: Approve/Reject buttons with proper status display
- **Rejection Modal**: Added modal with mandatory reason textarea

#### Invoices Tab (QuickBooks Invoices):
- **New Column**: "Actions" column added to table
- **Approve Button**: Green button to approve invoice
- **Reject Button**: Red button to reject with mandatory reason
- **Status Display**: Shows current approval status (Approved/Rejected/Pending)
- **Handlers**:
  - `handleApproveQBInvoice()` - Approves QB invoice
  - `handleRejectQBInvoice()` - Opens rejection modal
  - `submitQBRejection()` - Submits rejection with reason

### 3. Admin Portal Updates
**File**: `src/app/admin/invoices/page.tsx`
- **Already Had**: "Client Approval" column showing status
- **Display**: Shows Approved (green), Rejected (red), or Pending (yellow)
- **Rejection Reason**: Displays reason below status if rejected
- **API Update**: Added `clientApprovedAt` and `clientApprovedBy` fields to response

### 4. API Response Updates

#### Admin Invoices API
**File**: `src/app/api/admin/invoices/route.ts`
- Added fields: `clientApprovedAt`, `clientApprovedBy`

#### Client Invoices API
**File**: `src/app/api/client/invoices/route.ts`
- Added projection with fields: `clientApprovalStatus`, `rejectionReason`, `clientApprovedAt`, `clientApprovedBy`

#### Transporter Invoices API
**File**: `src/app/api/transporter/invoices/route.ts`
- Added fields: `clientApprovalStatus`, `rejectionReason`, `clientApprovedAt`

### 5. Document Approval Sync
**File**: `src/app/api/documents/[id]/approve/route.ts`
- Already syncs POD and Invoice documents
- When invoice approved/rejected, related POD is updated
- When POD approved/rejected, related invoice is updated

## Database Schema

### Invoice Collection Fields
```javascript
{
  clientApprovalStatus: 'PENDING_CLIENT' | 'APPROVED' | 'REJECTED',
  rejectionReason: String,  // Only set when rejected
  clientApprovedAt: Date,
  clientApprovedBy: ObjectId  // Reference to user who approved/rejected
}
```

### Document Collection Fields (PODs)
```javascript
{
  clientApprovalStatus: 'PENDING_CLIENT' | 'APPROVED' | 'REJECTED',
  rejectionReason: String,
  clientApprovedAt: Date,
  clientApprovedBy: ObjectId
}
```

## User Flow

### Client Approves Invoice:
1. Client clicks "Approve" button
2. API validates client ownership
3. Invoice `clientApprovalStatus` set to 'APPROVED'
4. Related POD document synced with same status
5. Page refreshes to show updated status

### Client Rejects Invoice:
1. Client clicks "Reject" button
2. Modal opens requesting rejection reason
3. Client enters reason (mandatory)
4. Client clicks "Reject Invoice"
5. API validates reason is provided
6. Invoice `clientApprovalStatus` set to 'REJECTED'
7. `rejectionReason` field saved
8. Related POD document synced with same status and reason
9. Page refreshes to show updated status

### Status Display:
- **Pending**: Yellow badge with ⏳ icon
- **Approved**: Green badge with ✓ icon
- **Rejected**: Red badge with ✕ icon + reason displayed

## Testing Checklist

- [ ] Client can approve invoice in POD Management tab
- [ ] Client can reject invoice with reason in POD Management tab
- [ ] Client can approve invoice in Invoices tab
- [ ] Client can reject invoice with reason in Invoices tab
- [ ] Rejection modal validates reason is not empty
- [ ] POD View button opens document in new tab
- [ ] Admin portal shows client approval status
- [ ] Admin portal shows rejection reason when rejected
- [ ] Transporter can see approval status (if they have access to invoices)
- [ ] Approved invoices cannot be rejected
- [ ] Rejected invoices cannot be approved (unless re-submitted)
- [ ] Status syncs between POD and Invoice documents

## Notes

- **No Existing Features Disturbed**: All existing functionality preserved
- **Mandatory Rejection Reason**: Cannot reject without providing reason
- **Status Sync**: POD and Invoice documents stay in sync
- **Access Control**: Only invoice owner (client) can approve/reject
- **View Button Fix**: POD documents now open in new tab instead of modal
