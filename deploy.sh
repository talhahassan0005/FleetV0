#!/bin/bash

echo "=== FleetXchange Deployment Script ==="
echo "Current directory: $(pwd)"

# Check if files exist
if [ -f package.json ]; then
  echo "✓ package.json found"
else
  echo "✗ package.json NOT found - exiting"
  exit 1
fi

echo ""
echo "=== Installing dependencies ==="
npm install

echo ""
echo "=== Building application ==="
npm run build

echo ""
echo "=== Installing PM2 globally ==="
npm install -g pm2

echo ""
echo "=== Starting application with PM2 ==="
pm2 start npm --name "fleetxchange" -- start
pm2 save
pm2 startup

echo ""
echo "=== Deployment complete! ==="
echo "App is running on port 3000"
echo "View logs: pm2 logs fleetxchange"
echo "Stop app: pm2 stop fleetxchange"

exit 0
