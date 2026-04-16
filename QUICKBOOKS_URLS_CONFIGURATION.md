# QuickBooks App URLs Configuration Guide

## Problem
Error: "Sorry, but Fleetxchange-invoice didn't connect"

This happens when App URLs are not properly configured in QuickBooks Developer Portal.

## Solution: Configure All Required URLs

### Step 1: Go to QuickBooks Developer Portal

1. Visit: https://developer.intuit.com/app/developer/myapps
2. Click on your app: **"Fleetxchange-invoice"**
3. Go to **"App settings"** tab (or "Settings" tab)

### Step 2: Configure URLs for Development (localhost)

Fill in these values:

```
┌─────────────────────────────────────────────────────────────┐
│ Host domain *                                               │
│ localhost:3000                                              │
│ (No "https://" protocol needed)                             │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ Launch URL *                                                │
│ http://localhost:3000/admin/dashboard                       │
│ (Include the "http://" protocol)                            │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ Disconnect URL *                                            │
│ http://localhost:3000/admin/dashboard/quickbooks            │
│ (Include the "http://" protocol)                            │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ Connect/Reconnect URL *                                     │
│ http://localhost:3000/admin/dashboard/quickbooks            │
│ (Include the "http://" protocol)                            │
└─────────────────────────────────────────────────────────────┘
```

### Step 3: Configure Redirect URIs

In the **"Keys & credentials"** tab:

#### Development (Sandbox) Redirect URIs:
```
http://localhost:3000/api/quickbooks/auth
```

#### Production Redirect URIs:
```
http://localhost:3000/api/quickbooks/auth
```

**IMPORTANT:** Add the redirect URI in BOTH sections!

### Step 4: Save All Changes

Click **"Save"** button at the bottom of the page.

## Complete Configuration Checklist

### ✅ App Settings Tab
- [ ] Host domain: `localhost:3000`
- [ ] Launch URL: `http://localhost:3000/admin/dashboard`
- [ ] Disconnect URL: `http://localhost:3000/admin/dashboard/quickbooks`
- [ ] Connect/Reconnect URL: `http://localhost:3000/admin/dashboard/quickbooks`

### ✅ Keys & Credentials Tab
- [ ] Development Redirect URI: `http://localhost:3000/api/quickbooks/auth`
- [ ] Production Redirect URI: `http://localhost:3000/api/quickbooks/auth`
- [ ] Production Client ID copied
- [ ] Production Client Secret copied

### ✅ Environment Variables (.env.local)
- [ ] QUICKBOOKS_CLIENT_ID (Production key)
- [ ] QUICKBOOKS_CLIENT_SECRET (Production key)
- [ ] QUICKBOOKS_REDIRECT_URI: `http://localhost:3000/api/quickbooks/auth`
- [ ] QUICKBOOKS_ENVIRONMENT: `PRODUCTION`

### ✅ Server
- [ ] Development server restarted

## URL Explanation

### Host Domain
```
localhost:3000
```
- This is your app's main domain
- No protocol (http:// or https://)
- For production: `your-domain.com`

### Launch URL
```
http://localhost:3000/admin/dashboard
```
- Where users land after successful authentication
- This is your admin dashboard
- Must include protocol (http:// or https://)

### Disconnect URL
```
http://localhost:3000/admin/dashboard/quickbooks
```
- Where users go when disconnecting QuickBooks
- This is your QuickBooks settings page
- Must include protocol

### Connect/Reconnect URL
```
http://localhost:3000/admin/dashboard/quickbooks
```
- Where users go to connect or reconnect
- Same as disconnect URL in our case
- Must include protocol

### Redirect URI (OAuth Callback)
```
http://localhost:3000/api/quickbooks/auth
```
- This is the OAuth callback endpoint
- QuickBooks redirects here after authentication
- Must match EXACTLY (no trailing slash!)

## Testing the Configuration

### Step 1: Restart Server
```bash
# Stop server (Ctrl+C)
npm run dev
```

### Step 2: Clear Browser Cache
1. Open DevTools (F12)
2. Go to Application tab
3. Clear all cookies for localhost:3000
4. Close DevTools

### Step 3: Test Connection
1. Go to: http://localhost:3000/admin/dashboard
2. Click on "QuickBooks" tab
3. Click "Connect QuickBooks" button
4. You should be redirected to QuickBooks login
5. Login with your REAL QuickBooks account
6. Authorize the app
7. You should be redirected back to: http://localhost:3000/admin/dashboard/quickbooks
8. Status should show "Connected" ✅

## Common Issues & Solutions

### Issue 1: "Connection problem" error
**Cause:** URLs not configured or incorrect
**Solution:** 
- Double-check all URLs in App Settings
- Make sure there are no typos
- Ensure protocols are correct (http:// for localhost)

### Issue 2: "Redirect URI mismatch"
**Cause:** Redirect URI not added in Production section
**Solution:**
- Go to Keys & Credentials tab
- Add redirect URI in BOTH Development AND Production sections
- Save changes

### Issue 3: "Invalid client"
**Cause:** Using Sandbox keys in Production mode
**Solution:**
- Copy PRODUCTION Client ID and Secret
- Update .env.local with production keys
- Restart server

### Issue 4: Redirects to wrong page after auth
**Cause:** Launch URL or Redirect URI incorrect
**Solution:**
- Launch URL should be: `http://localhost:3000/admin/dashboard`
- Redirect URI should be: `http://localhost:3000/api/quickbooks/auth`
- These are different!

## Production Deployment URLs

When you deploy to production, update these:

```
Host domain:
your-domain.com

Launch URL:
https://your-domain.com/admin/dashboard

Disconnect URL:
https://your-domain.com/admin/dashboard/quickbooks

Connect/Reconnect URL:
https://your-domain.com/admin/dashboard/quickbooks

Redirect URI (in Keys & Credentials):
https://your-domain.com/api/quickbooks/auth
```

**Note:** Use `https://` for production, not `http://`

## Verification Steps

After configuration, verify:

1. **In QuickBooks Developer Portal:**
   - All URLs saved correctly
   - No typos in URLs
   - Protocols correct (http:// for localhost)

2. **In .env.local:**
   - Production keys used
   - QUICKBOOKS_ENVIRONMENT="PRODUCTION"
   - Redirect URI matches exactly

3. **In Browser:**
   - Clear cache and cookies
   - Test connection flow
   - Check for any console errors

4. **In Server Logs:**
   ```
   [QuickBooks] Environment: PRODUCTION
   [QuickBooks] Redirect URI: http://localhost:3000/api/quickbooks/auth
   [QuickBooks] Auth successful
   ```

## Important Notes

⚠️ **URL Matching:**
- URLs must match EXACTLY
- No trailing slashes
- Correct protocol (http:// vs https://)
- Case-sensitive

⚠️ **Development vs Production:**
- Use http:// for localhost
- Use https:// for production domain
- Update ALL URLs when deploying

⚠️ **After Changes:**
- Always save in QuickBooks portal
- Always restart your server
- Always clear browser cache

## Success Indicators

When everything is configured correctly:

✅ No connection errors
✅ Smooth redirect to QuickBooks login
✅ Successful authorization
✅ Redirect back to your app
✅ "Connected" status in dashboard
✅ Realm ID saved in database

## Next Steps After Successful Connection

1. Test creating a customer in QuickBooks
2. Test creating an invoice
3. Verify invoice appears in QuickBooks
4. Test the full workflow

## Support

If you still face issues after following this guide:

1. Check server console for errors
2. Check browser console for errors
3. Verify all URLs are saved in QB portal
4. Ensure production keys are used
5. Try disconnecting and reconnecting

## Quick Reference

### Development (localhost)
```
Host: localhost:3000
Launch: http://localhost:3000/admin/dashboard
Disconnect: http://localhost:3000/admin/dashboard/quickbooks
Connect: http://localhost:3000/admin/dashboard/quickbooks
Redirect: http://localhost:3000/api/quickbooks/auth
```

### Production (deployed)
```
Host: your-domain.com
Launch: https://your-domain.com/admin/dashboard
Disconnect: https://your-domain.com/admin/dashboard/quickbooks
Connect: https://your-domain.com/admin/dashboard/quickbooks
Redirect: https://your-domain.com/api/quickbooks/auth
```

---

**Remember:** All URLs must be configured in QuickBooks Developer Portal before the connection will work!
