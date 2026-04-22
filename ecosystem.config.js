module.exports = {
  apps: [
    {
      name: "fleetxch",
      script: "node_modules/.bin/next",
      args: "start -p 3000",
      cwd: "/var/www/FleetV0",
      env: {
        NODE_ENV: "production"
      }
    },
    {
      name: "fleet-socket",
      script: "socket-server.js",
      cwd: "/var/www/FleetV0",
      env: {
        NODE_ENV: "production"
      }
    }
  ]
}
