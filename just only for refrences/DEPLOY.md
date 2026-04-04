# FleetXchange — Next.js Deployment Guide
# Stack: Next.js 14 + Node.js + PostgreSQL + Cloudinary + Vercel/Railway

## ─────────────────────────────────────────────
## OPTION A — Vercel (frontend) + Railway (DB)
## Recommended. Free tiers available. Fastest setup.
## ─────────────────────────────────────────────

### 1. Set up PostgreSQL on Railway
# Go to railway.app → New Project → PostgreSQL
# Copy the DATABASE_URL from the Variables tab

### 2. Set up Cloudinary (file storage)
# Go to cloudinary.com → free account
# Copy: Cloud Name, API Key, API Secret from dashboard

### 3. Deploy to Vercel
# Go to vercel.com → Import Git Repository
# Or use CLI:
npm i -g vercel
vercel login
vercel --prod

# Add all environment variables in Vercel dashboard → Settings → Environment Variables:
DATABASE_URL=postgresql://...       (from Railway)
NEXTAUTH_SECRET=<run: openssl rand -base64 32>
NEXTAUTH_URL=https://your-domain.vercel.app
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=info@fleetxchange.africa
SMTP_PASS=<gmail app password>
SMTP_FROM=FleetXchange <info@fleetxchange.africa>

### 4. Run database migrations
# In your local terminal (with DATABASE_URL set in .env):
npx prisma db push
npx prisma db seed

# This creates all tables and the admin account:
# Email:    admin@fleetxchange.africa
# Password: FXadmin2024!  ← CHANGE IMMEDIATELY after first login

## ─────────────────────────────────────────────
## OPTION B — Self-hosted on Rackzar VPS
## ─────────────────────────────────────────────

### 1. Connect and install
ssh root@YOUR_SERVER_IP
apt update && apt upgrade -y
apt install nodejs npm postgresql nginx -y
npm install -g pm2

### 2. Install PostgreSQL and create DB
sudo -u postgres psql
  CREATE DATABASE fleetxchange;
  CREATE USER fxuser WITH PASSWORD 'strong-password-here';
  GRANT ALL PRIVILEGES ON DATABASE fleetxchange TO fxuser;
  \q

### 3. Upload and install project
# Upload zip to server, then:
cd /var/www
unzip fleetxchange-next.zip
cd fleetxchange-next
npm install

### 4. Create .env file
cp .env.example .env
nano .env
# Fill in all values. DATABASE_URL = postgresql://fxuser:password@localhost:5432/fleetxchange

### 5. Build and seed
npx prisma db push
npx prisma db seed
npm run build

### 6. Start with PM2
pm2 start npm --name "fleetxchange" -- start
pm2 startup
pm2 save

### 7. Nginx config
cat > /etc/nginx/sites-available/fleetxchange << 'EOF'
server {
    listen 80;
    server_name portal.fleetxchange.africa;
    client_max_body_size 20M;
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF
ln -s /etc/nginx/sites-available/fleetxchange /etc/nginx/sites-enabled/
nginx -t && systemctl restart nginx

### 8. SSL
apt install certbot python3-certbot-nginx -y
certbot --nginx -d portal.fleetxchange.africa

## ─────────────────────────────────────────────
## USEFUL COMMANDS
## ─────────────────────────────────────────────
npm run dev          # Local development (http://localhost:3000)
npm run build        # Production build
npx prisma studio    # Visual DB browser
pm2 logs fleetxchange  # View live logs (VPS)
pm2 restart fleetxchange  # Restart after code update

## ─────────────────────────────────────────────
## TRACKING API INTEGRATION (when ready)
## ─────────────────────────────────────────────
# 1. Open src/lib/tracking.ts
# 2. Uncomment and implement fetchLiveTracking()
# 3. Add to .env: TRACKING_API_KEY and TRACKING_API_URL
# 4. Uncomment GPS columns in prisma/schema.prisma
# 5. Run: npx prisma db push
# 6. In src/app/track/[token]/page.tsx, uncomment:
#    const liveData = await fetchLiveTracking(link.externalTrackingId ?? '')
# 7. Pass liveData to template and render GPS map (Mapbox/Google Maps)
# Everything is stubbed and ready — it's a one-afternoon job.
