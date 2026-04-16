# Vercel Production Deployment Guide

## Production Domain
```
https://fleet-v0.vercel.app
```

## Complete Deployment Checklist

### ✅ Phase 1: QuickBooks Developer Portal Setup

#### 1.1 App Settings Configuration

Go to: https://developer.intuit.com/app/developer/myapps
Select: "Fleetxchange-invoice"
Tab: "App settings"

**Enter these exact values:**

```
Host domain:
fleet-v0.vercel.app

Launch URL:
https://fleet-v0.vercel.app/admin/dashboard

Disconnect URL:
https://fleet-v0.vercel.app/admin/dashboard/quickbooks

Connect/Reconnect URL:
https://fleet-v0.vercel.app/admin/dashboard/quickbooks
```

#### 1.2 Redirect URIs Configuration

Tab: "Keys & credentials"
Section: "Production Redirect URIs"

**Add BOTH URLs:**
```
1. http://localhost:3000/api/quickbooks/auth
   (For local development testing)

2. https://fleet-v0.vercel.app/api/quickbooks/auth
   (For production)
```

**IMPORTANT:** Click "Add URI" for each one separately!

#### 1.3 Get Production Keys

In "Keys & credentials" tab:

**Copy these values:**
- Production Client ID
- Production Client Secret

**DO NOT use Sandbox keys!**

---

### ✅ Phase 2: Vercel Environment Variables

#### 2.1 Go to Vercel Dashboard

1. Visit: https://vercel.com/dashboard
2. Select your project: "fleet-v0"
3. Go to: Settings → Environment Variables

#### 2.2 Add All Environment Variables

**Database:**
```
MONGO_URL
mongodb+srv://Talha_Hassan:Rv7e@cluster0.m0xoebd.mongodb.net/?appName=FleetXChange

DATABASE_URL
mongodb+srv://Talha_Hassan:Rv7e@cluster0.m0xoebd.mongodb.net/?appName=FleetXChange
```

**NextAuth:**
```
NEXTAUTH_SECRET
fleetxchange-super-secret-key-min-32-chars-dev-2024-secure

NEXTAUTH_URL
https://fleet-v0.vercel.app

NEXT_PUBLIC_SITE_URL
https://fleet-v0.vercel.app
```

**Email Configuration:**
```
MAIL_FROM
info.fleetx2026@gmail.com

MAIL_HOST
smtp.gmail.com

MAIL_PORT
587

MAIL_USER
info.fleetx2026@gmail.com

MAIL_PASS
yokjfmrojxulhyko

OUTLOOK_PASSWORD
yokjfmrojxulhyko
```

**QuickBooks (PRODUCTION KEYS):**
```
QUICKBOOKS_CLIENT_ID
[YOUR_PRODUCTION_CLIENT_ID_FROM_QB_PORTAL]

QUICKBOOKS_CLIENT_SECRET
[YOUR_PRODUCTION_CLIENT_SECRET_FROM_QB_PORTAL]

QUICKBOOKS_REDIRECT_URI
https://fleet-v0.vercel.app/api/quickbooks/auth

QUICKBOOKS_ENVIRONMENT
PRODUCTION
```

**Socket.io (Optional - if you deploy socket server):**
```
NEXT_PUBLIC_SOCKET_URL
https://your-socket-server-url.com
```

**Cloudinary (Optional - for file uploads):**
```
CLOUDINARY_CLOUD_NAME
your_cloud_name

CLOUDINARY_API_KEY
your_api_key

CLOUDINARY_API_SECRET
your_api_secret
```

#### 2.3 Environment Scope

For each variable, select:
- ✅ Production
- ✅ Preview
- ✅ Development

---

### ✅ Phase 3: Deploy to Vercel

#### 3.1 Push Code to Git

```bash
git add .
git commit -m "Production deployment with QuickBooks integration"
git push origin main
```

#### 3.2 Vercel Auto-Deploy

Vercel will automatically:
1. Detect the push
2. Build the project
3. Deploy to production
4. Available at: https://fleet-v0.vercel.app

#### 3.3 Manual Deploy (if needed)

In Vercel Dashboard:
1. Go to Deployments tab
2. Click "Redeploy"
3. Select "Use existing Build Cache" (optional)
4. Click "Redeploy"

---

### ✅ Phase 4: Socket Server Deployment

**IMPORTANT:** Socket.io needs a separate server (not Vercel)

#### Option 1: Deploy to Railway.app

1. Go to: https://railway.app
2. Create new project
3. Deploy from GitHub
4. Select `socket-server.js`
5. Set PORT environment variable
6. Get deployment URL
7. Update `NEXT_PUBLIC_SOCKET_URL` in Vercel

#### Option 2: Deploy to Render.com

1. Go to: https://render.com
2. Create new Web Service
3. Connect GitHub repo
4. Build command: `npm install`
5. Start command: `node socket-server.js`
6. Get deployment URL
7. Update `NEXT_PUBLIC_SOCKET_URL` in Vercel

#### Option 3: Use Vercel Serverless Functions (Alternative)

Convert socket.io to use Vercel's serverless functions (requires code changes)

---

### ✅ Phase 5: Testing Production Deployment

#### 5.1 Test Basic Access

1. Visit: https://fleet-v0.vercel.app
2. Should see login page
3. Login with admin credentials
4. Should redirect to dashboard

#### 5.2 Test QuickBooks Connection

1. Go to: https://fleet-v0.vercel.app/admin/dashboard
2. Click "QuickBooks" tab
3. Click "Connect QuickBooks" button
4. Should redirect to QuickBooks login
5. Login with REAL QuickBooks account
6. Authorize the app
7. Should redirect back to: https://fleet-v0.vercel.app/admin/dashboard/quickbooks
8. Status should show "Connected" ✅

#### 5.3 Test Invoice Creation

1. Create a test load
2. Upload POD
3. Admin approves POD
4. Create invoice
5. Check QuickBooks - invoice should appear
6. Verify customer/vendor created

#### 5.4 Test Email Notifications

1. Create invoice
2. Check email inbox
3. Should receive invoice notification

---

### ✅ Phase 6: Monitoring & Logs

#### 6.1 Vercel Logs

1. Go to Vercel Dashboard
2. Select project
3. Go to "Logs" tab
4. Monitor for errors

#### 6.2 Check for Errors

Common issues:
- Environment variables not set
- QuickBooks redirect URI mismatch
- Database connection issues
- Socket.io connection issues

---

## Configuration Summary

### Local Development (localhost)

**QuickBooks App Settings:**
```
Host: localhost:3000
Launch: http://localhost:3000/admin/dashboard
Disconnect: http://localhost:3000/admin/dashboard/quickbooks
Connect: http://localhost:3000/admin/dashboard/quickbooks
Redirect: http://localhost:3000/api/quickbooks/auth
```

**Environment Variables (.env.local):**
```
NEXTAUTH_URL=http://localhost:3000
NEXT_PUBLIC_SITE_URL=http://localhost:3000
QUICKBOOKS_REDIRECT_URI=http://localhost:3000/api/quickbooks/auth
QUICKBOOKS_ENVIRONMENT=PRODUCTION
```

### Production (Vercel)

**QuickBooks App Settings:**
```
Host: fleet-v0.vercel.app
Launch: https://fleet-v0.vercel.app/admin/dashboard
Disconnect: https://fleet-v0.vercel.app/admin/dashboard/quickbooks
Connect: https://fleet-v0.vercel.app/admin/dashboard/quickbooks
Redirect: https://fleet-v0.vercel.app/api/quickbooks/auth
```

**Vercel Environment Variables:**
```
NEXTAUTH_URL=https://fleet-v0.vercel.app
NEXT_PUBLIC_SITE_URL=https://fleet-v0.vercel.app
QUICKBOOKS_REDIRECT_URI=https://fleet-v0.vercel.app/api/quickbooks/auth
QUICKBOOKS_ENVIRONMENT=PRODUCTION
```

---

## Important Notes

### 🔐 Security

1. **Never commit .env.local to git**
   - Already in .gitignore
   - Contains sensitive keys

2. **Use different secrets for production**
   - Generate new NEXTAUTH_SECRET for production
   - Use strong passwords

3. **Rotate keys regularly**
   - QuickBooks keys
   - Database passwords
   - Email passwords

### 🌐 Domain Configuration

1. **Custom Domain (Optional)**
   - Go to Vercel → Settings → Domains
   - Add custom domain (e.g., fleetxchange.com)
   - Update all URLs in QuickBooks portal
   - Update environment variables

2. **SSL Certificate**
   - Vercel provides automatic SSL
   - All URLs use https://

### 📊 Database

1. **MongoDB Atlas**
   - Already configured
   - Whitelist Vercel IPs (or use 0.0.0.0/0)
   - Monitor connection limits

2. **Backup Strategy**
   - Enable MongoDB Atlas backups
   - Regular exports recommended

### 📧 Email

1. **Gmail SMTP**
   - Currently using Gmail
   - May hit rate limits
   - Consider SendGrid/Mailgun for production

2. **Email Templates**
   - Test all email notifications
   - Verify links work with production URLs

### 💬 Real-time Chat

1. **Socket.io Server**
   - Must be deployed separately
   - Cannot run on Vercel (serverless limitation)
   - Use Railway, Render, or Heroku

2. **WebSocket Connection**
   - Update NEXT_PUBLIC_SOCKET_URL
   - Test chat functionality after deployment

---

## Troubleshooting

### Issue: QuickBooks connection fails

**Check:**
1. Production keys used (not sandbox)
2. Redirect URI added in Production section
3. All URLs use https:// (not http://)
4. Environment variables set in Vercel
5. Vercel deployment successful

**Solution:**
```bash
# Check Vercel logs
vercel logs

# Redeploy
vercel --prod
```

### Issue: Database connection fails

**Check:**
1. MongoDB Atlas IP whitelist
2. Connection string correct
3. Database user has permissions

**Solution:**
- Add 0.0.0.0/0 to IP whitelist (for Vercel)
- Verify connection string in Vercel env vars

### Issue: Email not sending

**Check:**
1. Gmail "Less secure apps" enabled
2. App password generated
3. SMTP credentials correct

**Solution:**
- Use Gmail App Password
- Test with a simple email first

### Issue: Socket.io not connecting

**Check:**
1. Socket server deployed
2. NEXT_PUBLIC_SOCKET_URL correct
3. CORS configured on socket server

**Solution:**
- Deploy socket server separately
- Update environment variable
- Test WebSocket connection

---

## Post-Deployment Checklist

- [ ] Production deployed successfully
- [ ] QuickBooks connects without errors
- [ ] Can create invoices
- [ ] Invoices appear in QuickBooks
- [ ] Email notifications working
- [ ] Chat functionality working (if socket deployed)
- [ ] All pages load correctly
- [ ] No console errors
- [ ] Mobile responsive
- [ ] SSL certificate active
- [ ] Database connections stable
- [ ] Monitoring set up

---

## Maintenance

### Regular Tasks

1. **Monitor Vercel Logs**
   - Check for errors daily
   - Set up error alerts

2. **Database Maintenance**
   - Monitor storage usage
   - Review slow queries
   - Regular backups

3. **QuickBooks Token Refresh**
   - Tokens auto-refresh
   - Monitor for auth failures
   - Reconnect if needed

4. **Security Updates**
   - Update dependencies monthly
   - Review security advisories
   - Rotate secrets quarterly

---

## Support & Resources

### Vercel
- Dashboard: https://vercel.com/dashboard
- Docs: https://vercel.com/docs
- Support: https://vercel.com/support

### QuickBooks
- Developer Portal: https://developer.intuit.com
- API Docs: https://developer.intuit.com/app/developer/qbo/docs/api/accounting/all-entities/invoice
- Support: https://help.developer.intuit.com

### MongoDB Atlas
- Dashboard: https://cloud.mongodb.com
- Docs: https://docs.atlas.mongodb.com
- Support: https://support.mongodb.com

---

## Success Indicators

When deployment is successful:

✅ App accessible at https://fleet-v0.vercel.app
✅ Login works
✅ Dashboard loads
✅ QuickBooks connects
✅ Invoices create successfully
✅ Emails send
✅ No errors in logs
✅ All features functional

---

**Deployment Date:** [Add date when deployed]
**Deployed By:** [Your name]
**Version:** 1.0.0
**Status:** Production Ready 🚀
