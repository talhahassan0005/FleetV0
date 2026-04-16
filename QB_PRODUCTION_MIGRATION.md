# QuickBooks: Sandbox → Production Migration Guide

## Current Setup (SANDBOX)

### Environment Variables (.env.local)
```
QUICKBOOKS_CLIENT_ID="AB0DMjJd5ByaC5WP6MiSinwY69wlWUhEESKRNOOX4q97Dfp97n"
QUICKBOOKS_CLIENT_SECRET="Ir4JKYyUuriZWEVwHXhQljvFx2sMGAjtXpWcguzw"
QUICKBOOKS_REDIRECT_URI="http://localhost:3000/api/quickbooks/auth"
QUICKBOOKS_ENVIRONMENT="SANDBOX"  ← Currently SANDBOX
```

### Code Configuration (src/lib/quickbooks.ts)
```typescript
const QB_ENVIRONMENT = (process.env.QUICKBOOKS_ENVIRONMENT || 'SANDBOX') as 'SANDBOX' | 'PRODUCTION';

const QB_API_BASE_URL =
  QB_ENVIRONMENT === 'SANDBOX'
    ? 'https://sandbox-quickbooks.api.intuit.com/v3/company'  ← SANDBOX URL
    : 'https://quickbooks.api.intuit.com/v3/company';         ← PRODUCTION URL

export function getQBDashboardURL(): string {
  return QB_ENVIRONMENT === 'SANDBOX'
    ? 'https://app.sandbox.qbo.intuit.com'  ← SANDBOX Dashboard
    : 'https://qbo.intuit.com';             ← PRODUCTION Dashboard
}
```

---

## Migration Steps: SANDBOX → PRODUCTION

### Step 1: Create Production App in QuickBooks

1. **Go to:** https://developer.intuit.com/app/developer/myapps
2. **Click:** "Create an app"
3. **Select:** "QuickBooks Online and Payments"
4. **App Name:** FleetXChange Production
5. **Copy:**
   - Production Client ID
   - Production Client Secret

### Step 2: Configure Production App

**In QB Developer Portal:**

1. **Keys & credentials** tab:
   - Copy Production Client ID
   - Copy Production Client Secret

2. **Redirect URIs:**
   ```
   https://yourdomain.com/api/quickbooks/auth
   ```
   ⚠️ **IMPORTANT:** Must be HTTPS in production!

3. **Scopes** (ensure these are enabled):
   - `com.intuit.quickbooks.accounting` ✅

### Step 3: Update Environment Variables

**Production .env file:**
```bash
# QuickBooks Production Configuration
QUICKBOOKS_CLIENT_ID="<PRODUCTION_CLIENT_ID>"
QUICKBOOKS_CLIENT_SECRET="<PRODUCTION_CLIENT_SECRET>"
QUICKBOOKS_REDIRECT_URI="https://yourdomain.com/api/quickbooks/auth"
QUICKBOOKS_ENVIRONMENT="PRODUCTION"  ← Change to PRODUCTION
```

⚠️ **CRITICAL:** 
- Use HTTPS redirect URI (not HTTP)
- Update domain from localhost to actual domain
- Keep credentials secure (use environment variables, not hardcoded)

### Step 4: Code Changes Required

**✅ NO CODE CHANGES NEEDED!**

The code already handles both environments:
```typescript
// src/lib/quickbooks.ts
const QB_ENVIRONMENT = process.env.QUICKBOOKS_ENVIRONMENT || 'SANDBOX';
const QB_API_BASE_URL = QB_ENVIRONMENT === 'SANDBOX'
  ? 'https://sandbox-quickbooks.api.intuit.com/v3/company'
  : 'https://quickbooks.api.intuit.com/v3/company';
```

Just change the environment variable and it automatically switches!

### Step 5: Database Migration

**⚠️ IMPORTANT:** Sandbox data ≠ Production data

**Current MongoDB Structure:**
```javascript
users: {
  quickbooksAccounts: [
    {
      country: "South Africa",
      currency: "ZAR",
      realmId: "9341456843564755",  ← SANDBOX Realm ID
      accessToken: "...",
      refreshToken: "...",
      isConnected: true
    }
  ]
}
```

**Migration Steps:**

1. **Clear Sandbox Connections:**
   ```javascript
   db.users.updateMany(
     { role: "ADMIN" },
     { 
       $set: { 
         "quickbooksAccounts": [],
         "quickbooks.isConnected": false 
       } 
     }
   )
   ```

2. **Admin Reconnects in Production:**
   - Admin goes to `/admin/dashboard/quickbooks`
   - Clicks "Connect" for each country
   - Authorizes with PRODUCTION QuickBooks account
   - New Production Realm IDs saved automatically

### Step 6: Testing Checklist

**Before Going Live:**

- [ ] Production QB app created
- [ ] Production credentials in .env
- [ ] QUICKBOOKS_ENVIRONMENT="PRODUCTION"
- [ ] Redirect URI uses HTTPS
- [ ] Redirect URI matches QB app settings
- [ ] Admin can connect QB accounts
- [ ] Test invoice creation
- [ ] Test bill creation
- [ ] Test payment sync
- [ ] Verify QB dashboard links work

**Test Flow:**
1. Admin connects QB (production account)
2. Create test load
3. Upload POD
4. Create invoice
5. Check QB dashboard - invoice should appear
6. Verify links work (should go to qbo.intuit.com, not sandbox)

---

## Key Differences: Sandbox vs Production

### 1. **API URLs**
| Environment | API Base URL |
|------------|--------------|
| Sandbox | `https://sandbox-quickbooks.api.intuit.com` |
| Production | `https://quickbooks.api.intuit.com` |

### 2. **Dashboard URLs**
| Environment | Dashboard URL |
|------------|---------------|
| Sandbox | `https://app.sandbox.qbo.intuit.com` |
| Production | `https://qbo.intuit.com` |

### 3. **Realm IDs**
- Sandbox Realm ID ≠ Production Realm ID
- Each QB company has unique Realm ID
- Must reconnect in production to get new Realm IDs

### 4. **Data**
- Sandbox data is separate from production
- Customers/Vendors created in sandbox won't exist in production
- Must recreate or sync data after migration

### 5. **OAuth Tokens**
- Sandbox tokens don't work in production
- Must re-authorize in production
- Tokens expire after 1 hour (auto-refresh implemented)

---

## Environment-Specific Features

### Features That Work in Both:
✅ OAuth authentication
✅ Customer/Vendor creation
✅ Invoice/Bill creation
✅ Payment sync
✅ Token refresh
✅ Multi-currency support

### Sandbox Limitations:
❌ Bill email (`/bill/{id}/send`) - Not supported in sandbox
✅ Invoice email (`/invoice/{id}/send`) - Works in both

### Production Benefits:
✅ Real accounting data
✅ All API endpoints supported
✅ Email notifications work
✅ Integration with real bank accounts
✅ Actual payment processing

---

## Rollback Plan

If production has issues:

1. **Switch back to sandbox:**
   ```bash
   QUICKBOOKS_ENVIRONMENT="SANDBOX"
   ```

2. **Restart application**

3. **Reconnect sandbox accounts**

4. **No code changes needed**

---

## Security Considerations

### Production Security:

1. **HTTPS Required:**
   - Redirect URI must use HTTPS
   - QB requires SSL certificate

2. **Credentials:**
   - Store in environment variables
   - Never commit to git
   - Use secrets manager in production

3. **Token Storage:**
   - Tokens stored in MongoDB (encrypted connection)
   - Auto-refresh before expiry
   - Secure token transmission

4. **Access Control:**
   - Only ADMIN role can connect QB
   - OAuth flow validates user
   - Realm ID tied to specific company

---

## Monitoring & Logs

### What to Monitor:

1. **Token Refresh:**
   ```
   [QB Refresh Wrapper] ✅ Token refreshed successfully
   ```

2. **API Errors:**
   ```
   [QB API Error] Status: 401 | Body: {...}
   ```

3. **Invoice Creation:**
   ```
   [Invoice] ✅ QB Invoice created: 123
   ```

4. **Connection Status:**
   ```
   [QB Router] ✅ Found QB account for currency ZAR
   ```

### Common Production Issues:

1. **401 Unauthorized:**
   - Token expired → Auto-refresh should handle
   - Invalid credentials → Check .env

2. **404 Not Found:**
   - Wrong environment URL → Check QUICKBOOKS_ENVIRONMENT
   - Invalid Realm ID → Reconnect QB account

3. **400 Bad Request:**
   - Invalid data format → Check API payload
   - Duplicate entity → Handle in code

---

## Summary: What Changes for Production

### ✅ Changes Required:
1. Environment variable: `QUICKBOOKS_ENVIRONMENT="PRODUCTION"`
2. New QB app credentials (Client ID & Secret)
3. HTTPS redirect URI
4. Reconnect QB accounts (new Realm IDs)

### ❌ NO Changes Required:
1. Code (already handles both environments)
2. Database schema
3. API endpoints
4. Frontend UI
5. Invoice/Bill creation logic

### 🔄 One-Time Setup:
1. Create production QB app
2. Update .env file
3. Admin reconnects QB accounts
4. Test invoice creation

**That's it!** The system is designed to work in both environments with just environment variable changes.
