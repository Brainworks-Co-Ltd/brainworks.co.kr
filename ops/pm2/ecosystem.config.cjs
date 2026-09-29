module.exports = {
  apps: [
    {
      name: "brainworks-web",
      cwd: "/srv/brainworks/current",
      script: "server.js",
      exec_mode: "fork",
      instances: 1,
      autorestart: true,
      max_memory_restart: "1G",
      env: {
        NODE_ENV: "production",
        HOSTNAME: "127.0.0.1",
        PORT: "3000",
        TZ: "Asia/Seoul",
      },
    },
  ],
};
