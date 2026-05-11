module.exports = {
  apps: [
    {
      name: "fleetxch",
      script: "node_modules/.bin/next",
      args: "start -p 3001",
      cwd: "/var/www/fleetxchange/FleetV0",
      env: {
        NODE_ENV: "production"
      }
    },
    {
      name: "fleet-socket",
      script: "socket-server.js",
      cwd: "/var/www/fleetxchange/FleetV0",
      env: {
        NODE_ENV: "production"
      }
    }
  ]
}
