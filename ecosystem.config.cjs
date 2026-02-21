// PM2 Process Manager Configuration
// Start:   pm2 start ecosystem.config.cjs
// Prod:    pm2 start ecosystem.config.cjs --env production
// Logs:    pm2 logs origina
// Monitor: pm2 monit

module.exports = {
  apps: [
    {
      name: 'origina',
      script: 'server/dist/index.js',
      cwd: __dirname,

      // ─── Cluster Mode ──────────────────────────────────────
      instances: 'max',       // Use all CPU cores
      exec_mode: 'cluster',

      // ─── Auto-Restart ──────────────────────────────────────
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s',
      restart_delay: 4000,
      max_memory_restart: '512M',

      // ─── Graceful Shutdown ─────────────────────────────────
      kill_timeout: 5000,
      listen_timeout: 8000,
      shutdown_with_message: true,

      // ─── Logging ───────────────────────────────────────────
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      error_file: 'logs/origina-error.log',
      out_file: 'logs/origina-out.log',
      merge_logs: true,
      log_type: 'json',

      // ─── Watch (dev only — disabled in production) ─────────
      watch: false,
      ignore_watch: ['node_modules', 'logs', '.git', 'dist', 'coverage'],

      // ─── Environment — Development ─────────────────────────
      env: {
        NODE_ENV: 'development',
        PORT: 3001,
      },

      // ─── Environment — Production ──────────────────────────
      env_production: {
        NODE_ENV: 'production',
        PORT: 3001,
      },
    },
  ],
};
