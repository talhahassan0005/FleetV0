# QuickBooks Production Setup Guide

## Current Issue
Error: "Sorry, but Fleetxchange-invoice didn't connect"

## Root Cause
When switching from SANDBOX to PRODUCTION mode, you need to:
1. Use PRODUCTION keys (not SANDBOX keys)
2. Add Production Redirect URI in QuickBooks Developer Portal
3. Update environment variables

## Step-by-Step Fix

### Step 1: Get Production Keys from QuickBooks

1. Go to: https://developer.intuit.com/app/developer/myapps

2. Click on your app: **"Fleetxchange-invoice"**

3. Go to **"Keys & credentials"** tab

4. You'll see TWO sections:
   ```
   ┌─────────────────────────────────────┐
   │ Development Keys (Sandbox)          │
   │ - Sandbox Client ID                 │
   │ - Sandbox Client Secret             │
   └─────────────────────────────────────┘
   
   ┌─────────────────────────────────────┐
   │ Production Keys                     │
   │ - Production Client ID              │
   │ - Production Client Secret          │
   └─────────────────────────────────────┘
   ```

5. **IMPORTANT:** Copy the **PRODUCTION** keys (NOT Sandbox keys!)

### Step 2: Add Production Redirect URI

1. In the same **"Keys & credentials"** page

2. Scroll to **"Redirect URIs"** section

3. You'll see:
   ```
   Development Redirect URIs (for Sandbox):
   ✓ http://localhost:3000/api/quickbooks/auth
   
   Production Redirect URIs:
   [ Add URI ]
   ```

4. Click **"Add URI"** under Production section

5. Enter: `http://localhost:3000/api/quickbooks/auth`

6. If your app is deployed, also add:
   - `https://your-domain.com/api/quickbooks/auth`
   - `https://www.your-domain.com/api/quickbooks/auth`

7. Click **"Save"**

### Step 3: Update .env.local File

Replace the keys in your `.env.local` file:

```env
# BEFORE (Sandbox keys - these won't work in production!)
QUICKBOOKS_CLIENT_ID="AB0DMjJd5ByaC5WP6MiSinwY69wlWUhEESKRNOOX4q97Dfp97n"
QUICKBOOKS_CLIENT_SECRET="Ir4JKYyUuriZWEVwHXhQljvFx2sMGAjtXpWcguzw"
QUICKBOOKS_ENVIRONMENT="SANDBOX"

# AFTER (Production keys - get these from QB Developer Portal!)
QUICKBOOKS_CLIENT_ID="YOUR_PRODUCTION_CLIENT_ID_HERE"
QUICKBOOKS_CLIENT_SECRET="YOUR_PRODUCTION_CLIENT_SECRET_HERE"
QUICKBOOKS_REDIRECT_URI="http://localhost:3000/api/quickbooks/auth"
QUICKBOOKS_ENVIRONMENT="PRODUCTION"
```

### Step 4: Restart Development Server

```bash
# Stop the current server (Ctrl+C)
# Then restart:
npm run dev
```

### Step 5: Reconnect QuickBooks

1. Go to Admin Portal: http://localhost:3000/admin/dashboard

2. Click on **"QuickBooks"** tab

3. Click **"Connect QuickBooks"** button

4. You'll be redirected to QuickBooks login

5. Login with your **REAL QuickBooks account** (not sandbox)

6. Authorize the app

7. You should be redirected back successfully!

## Verification Checklist

After completing the steps, verify:

- [ ] Production Client ID copied from QB Developer Portal
- [ ] Production Client Secret copied from QB Developer Portal
- [ ] Production Redirect URI added in QB Developer Portal
- [ ] .env.local updated with PRODUCTION keys
- [ ] QUICKBOOKS_ENVIRONMENT set to "PRODUCTION"
- [ ] Development server restarted
- [ ] QuickBooks connection successful

## Common Mistakes to Avoid

### ❌ Mistake 1: Using Sandbox Keys in Production
```env
# WRONG - These are sandbox keys
QUICKBOOKS_CLIENT_ID="AB0DMjJd5ByaC5WP6MiSinwY69wlWUhEESKRNOOX4q97Dfp97n"
QUICKBOOKS_ENVIRONMENT="PRODUCTION"  # ← Won't work!
```

### ✅ Correct: Use Production Keys
```env
# CORRECT - Get production keys from QB portal
QUICKBOOKS_CLIENT_ID="YOUR_PRODUCTION_CLIENT_ID"
QUICKBOOKS_ENVIRONMENT="PRODUCTION"
```

### ❌ Mistake 2: Forgetting to Add Production Redirect URI
- Sandbox redirect URI ≠ Production redirect URI
- You must add the redirect URI in BOTH sections

### ❌ Mistake 3: Not Restarting Server
- Environment variables are loaded at startup
- You MUST restart the server after changing .env.local

## Troubleshooting

### Issue: Still getting connection error

**Check 1:** Verify you're using PRODUCTION keys
```bash
# In your .env.local, the keys should be different from sandbox
# Production keys are usually longer and different format
```

**Check 2:** Verify Redirect URI is added in Production section
- Go to QB Developer Portal
- Check "Production Redirect URIs" section
- Should show: http://localhost:3000/api/quickbooks/auth

**Check 3:** Clear browser cache and cookies
```
1. Open browser DevTools (F12)
2. Go to Application tab
3. Clear all cookies for localhost:3000
4. Try connecting again
```

**Check 4:** Check server logs
```bash
# Look for these logs when connecting:
[QuickBooks] Environment: PRODUCTION
[QuickBooks] Using Client ID: YOUR_PRODUCTION_CLIENT_ID
```

### Issue: "Invalid client" error

This means:
- Client ID is wrong
- Client Secret is wrong
- Keys don't match the environment (using sandbox keys in production)

**Solution:** Double-check you copied PRODUCTION keys, not SANDBOX keys

### Issue: "Redirect URI mismatch"

This means:
- Redirect URI not added in Production section
- Typo in redirect URI

**Solution:** 
1. Go to QB Developer Portal
2. Add exact URI: `http://localhost:3000/api/quickbooks/auth`
3. No trailing slash, exact match required

## Key Differences: Sandbox vs Production

| Feature | Sandbox | Production |
|---------|---------|------------|
| Keys | Sandbox Client ID/Secret | Production Client ID/Secret |
| Redirect URI | Development section | Production section |
| QuickBooks Account | Test company | Real company |
| Data | Test data | Real data |
| Invoices | Not real | Real invoices |
| Payments | Simulated | Real payments |

## After Successful Connection

Once connected, you'll see:
- ✅ Green "Connected" status in Admin Dashboard
- ✅ Realm ID saved in database
- ✅ Access token stored
- ✅ Ready to create invoices

## Next Steps

1. Test invoice creation with a small amount
2. Verify invoice appears in your real QuickBooks account
3. Check that customer/vendor sync works
4. Test the full workflow: Load → POD → Invoice

## Support

If you still face issues:
1. Check server console logs
2. Check browser console logs
3. Verify all environment variables are correct
4. Ensure QuickBooks account has proper permissions

## Important Notes

⚠️ **Production Mode Implications:**
- All invoices will be REAL
- All customers/vendors will be created in your REAL QuickBooks
- All data will sync to your REAL QuickBooks company
- Make sure you're ready for production use!

🔒 **Security:**
- Never commit .env.local to git
- Keep production keys secure
- Rotate keys if compromised
- Use environment variables in production deployment
