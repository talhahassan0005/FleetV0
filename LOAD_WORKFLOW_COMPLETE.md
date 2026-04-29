# Load Workflow - Complete Implementation

## Load Status Flow

```
PENDING → APPROVED → QUOTED → ASSIGNED → IN_TRANSIT → DELIVERED
   ↓
REJECTED
```

### Status Definitions

1. **PENDING** - Client posts load, waiting for admin review
2. **APPROVED** - Admin approves load, transporters can now quote
3. **QUOTED** - At least one transporter has submitted a quote
4. **ASSIGNED** - Admin assigns load to selected transporter
5. **IN_TRANSIT** - Load is being transported
6. **DELIVERED** - Load successfully delivered
7. **REJECTED** - Admin rejects the load
8. **CANCELLED** - Load cancelled

## Features Implemented

### 1. Client Load Tracking
**File:** `src/app/client/loads/[id]/page.tsx`

- Visual timeline showing load progress through all stages
- Color-coded status indicators (Green = completed, Blue = current, Gray = upcoming)
- Status-specific messages explaining what's happening
- Quotes display section (view only, no accept/reject)
- Complete load details with route, cargo, pricing

### 2. Admin Quote Management
**File:** `src/app/admin/loads/[id]/page.tsx`

- View all quotes for APPROVED, QUOTED, and ASSIGNED loads
- See transporter details and quoted prices
- Assign load by accepting a quote
- Reject quotes with optional reason
- Auto-reject other pending quotes when one is accepted

### 3. Admin Loads Dashboard
**File:** `src/app/admin/loads/page.tsx`

**Filter Tabs:**
- All Loads
- PENDING - Loads to review/approve
- APPROVED - Loads approved, waiting for quotes
- QUOTED - Loads with quotes, ready to assign
- ASSIGNED - Loads assigned to transporters
- IN_TRANSIT - Loads being transported
- DELIVERED - Completed loads
- CANCELLED - Cancelled loads

### 4. Quote Submission Auto-Status Update
**File:** `src/app/api/quotes/route.ts`

- When transporter submits quote on APPROVED load → status changes to QUOTED
- Transporters can quote on APPROVED or QUOTED status loads
- One quote per transporter per load

### 5. Load Assignment API
**File:** `src/app/api/admin/loads/[id]/assign/route.ts`

**Actions:**
- Updates load status to ASSIGNED
- Accepts selected quote
- Auto-rejects all other pending quotes
- Sends 3 types of emails:
  1. Client - Load assigned notification
  2. Accepted Transporter - Quote accepted notification
  3. Rejected Transporters - Quote not selected notification

### 6. Email Notifications

**Client Receives:**
- Load assigned with transporter details and agreed price

**Accepted Transporter Receives:**
- Quote accepted with load details and agreed price

**Rejected Transporters Receive:**
- Quote not selected notification

## API Endpoints

### Admin APIs
- `GET /api/admin/loads?status=QUOTED` - Get loads with quotes
- `GET /api/admin/loads/[id]` - Get load details
- `GET /api/admin/loads/[id]/quotes` - Get all quotes for a load
- `POST /api/admin/loads/[id]/assign` - Assign load to transporter
- `PATCH /api/admin/loads/[id]` - Approve/reject load

### Quote APIs
- `POST /api/quotes` - Submit quote (auto-updates load to QUOTED)
- `PATCH /api/quotes/[id]` - Admin reject quote with reason

### Client APIs
- `GET /api/client/loads/[id]` - Get load details with tracking

## Workflow Example

1. **Client posts load** → Status: PENDING
2. **Admin approves** → Status: APPROVED, transporters notified
3. **Transporter submits quote** → Status: QUOTED (automatic)
4. **More transporters quote** → Status: QUOTED (remains)
5. **Admin reviews quotes** → Views all quotes in admin panel
6. **Admin assigns load** → Status: ASSIGNED
   - Selected quote: ACCEPTED
   - Other quotes: AUTO_REJECTED
   - Client email: "Load assigned to [Transporter]"
   - Transporter email: "Your quote accepted!"
   - Others email: "Quote not selected"
7. **Transporter picks up** → Status: IN_TRANSIT
8. **Delivery complete** → Status: DELIVERED

## Testing Checklist

- [ ] Client can see visual tracking timeline
- [ ] Admin can view loads by status (PENDING, APPROVED, QUOTED, etc.)
- [ ] Admin can see all quotes on QUOTED loads
- [ ] Admin can assign load by accepting a quote
- [ ] Load status updates to QUOTED when first quote submitted
- [ ] Client receives email when load assigned
- [ ] Transporter receives email when quote accepted
- [ ] Other transporters receive rejection emails
- [ ] Only one quote per transporter per load allowed
- [ ] Auto-rejection of other quotes when one is accepted

## Files Modified

1. `src/app/client/loads/[id]/page.tsx` - Added tracking timeline
2. `src/app/admin/loads/[id]/page.tsx` - Added QUOTED status support
3. `src/app/admin/loads/page.tsx` - Removed QUOTING tab
4. `src/app/api/quotes/route.ts` - Auto-update to QUOTED status
5. `src/app/api/admin/loads/[id]/route.ts` - Status APPROVED on approval

## Notes

- QUOTING status removed from system (not needed)
- Load assignment is admin-controlled, not client-controlled
- All email notifications working via existing email system
- Visual tracking helps clients understand load progress
- Admin has full visibility of all quotes before assignment
