# OriginA — Deployment Guide

## Prerequisites

| Software | Version | Purpose |
|----------|---------|---------|
| Node.js | 22+ | Runtime |
| PostgreSQL | 17+ (with pgvector) | Primary database |
| Redis | 7+ | Caching, sessions, short-term memory |
| Nginx | 1.24+ | Reverse proxy, SSL termination |
| PM2 | 5+ | Process manager |

---

## Option A: Docker Compose (Quick Start)

```bash
# 1. Clone and configure
git clone <repo-url> origina && cd origina
cp .env.production.example .env
cp .env.production.example server/.env
# Edit both .env files with real credentials

# 2. Start everything
docker-compose up -d

# 3. Run database migrations
docker-compose exec app node -e "
  const { Pool } = require('pg');
  const fs = require('fs');
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const migrations = fs.readdirSync('server/src/db/migrations').sort();
  for (const file of migrations) {
    const sql = fs.readFileSync('server/src/db/migrations/' + file, 'utf8');
    await pool.query(sql);
    console.log('Applied:', file);
  }
  await pool.end();
"

# 4. Verify
curl https://localhost:3001/api/health
```

---

## Option B: Bare Metal VPS

### 1. System Setup

```bash
# Ubuntu 22.04+
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl git build-essential nginx

# Node.js 22
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs

# PM2
sudo npm install -g pm2

# PostgreSQL 17 with pgvector
sudo apt install -y postgresql-17 postgresql-17-pgvector

# Redis 7
sudo apt install -y redis-server
```

### 2. PostgreSQL Setup

```bash
sudo -u postgres psql << 'SQL'
CREATE USER origina WITH PASSWORD 'YOUR_STRONG_PASSWORD';
CREATE DATABASE origina OWNER origina;
\c origina
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS pgcrypto;
SQL
```

### 3. Deploy Application

```bash
# Clone
cd /var/www
git clone <repo-url> origina && cd origina

# Install dependencies
npm install
cd server && npm install && cd ..

# Configure environment
cp .env.production.example .env
cp .env.production.example server/.env
# Edit both files with real credentials

# Build
npm run build
cd server && npm run build && cd ..

# Run migrations
for f in server/src/db/migrations/*.sql; do
  echo "Applying $f..."
  PGPASSWORD=YOUR_PG_PASSWORD psql -h localhost -U origina -d origina -f "$f"
done
```

### 4. SSL with Let's Encrypt

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Generate DH parameters (one-time, takes a few minutes)
sudo openssl dhparam -out /etc/nginx/dhparam.pem 4096

# Get certificate
sudo certbot certonly --webroot -w /var/www/certbot \
  -d origina.io -d www.origina.io \
  --email admin@origina.io --agree-tos

# Copy nginx config
sudo cp nginx/origina.conf /etc/nginx/sites-available/origina
sudo cp nginx/ssl-params.conf /etc/nginx/ssl-params.conf
sudo ln -sf /etc/nginx/sites-available/origina /etc/nginx/sites-enabled/

# Test and reload
sudo nginx -t && sudo systemctl reload nginx

# Auto-renew (certbot installs a systemd timer by default)
sudo certbot renew --dry-run
```

### 5. PM2 Setup

```bash
cd /var/www/origina

# Create log directory
mkdir -p logs

# Start with production environment
pm2 start ecosystem.config.cjs --env production

# Save PM2 process list (survives reboots)
pm2 save

# Setup startup script (auto-start on boot)
pm2 startup systemd -u www-data --hp /var/www
# Run the command PM2 outputs

# Useful PM2 commands
pm2 status                    # List processes
pm2 logs origina           # Stream logs
pm2 logs origina --lines 100  # Last 100 lines
pm2 monit                     # Real-time dashboard
pm2 reload origina         # Zero-downtime reload
pm2 restart origina        # Hard restart
pm2 stop origina           # Stop
pm2 delete origina         # Remove from PM2
```

---

## Database Migrations

Run migrations in order after deployment or updates:

```bash
cd /var/www/origina

# Apply all migrations
for f in server/src/db/migrations/*.sql; do
  echo "Applying $f..."
  PGPASSWORD=$PG_PASSWORD psql -h $PG_HOST -U $PG_USER -d $PG_DATABASE -f "$f"
done
```

Migration files (in order):
1. `001_initial.sql` — sessions, messages, fleet, tasks, alerts, telemetry
2. `002_users.sql` — users table with auth
3. `003_tenants.sql` — multi-tenancy
4. `004_rbac.sql` — roles and permissions
5. `005_audit_log.sql` — audit trail
6. `006_sessions_pg.sql` — PostgreSQL session store
7. `007_memory.sql` — AI memory (short/long-term, episodic, profile)
8. `008_agents.sql` — agent registry and fleet
9. `009_conversations.sql` — AI conversation history
10. `010_connectors.sql` — channel connector configs
11. `011_voice.sql` — voice sessions and transcripts
12. `012_governor.sql` — governance rules and spending limits

---

## Backup Strategy

### Automated PostgreSQL Backup

```bash
# Create backup script
sudo tee /usr/local/bin/origina-backup.sh << 'SCRIPT'
#!/bin/bash
BACKUP_DIR="/var/backups/origina"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
mkdir -p "$BACKUP_DIR"

# Dump database
PGPASSWORD=$PG_PASSWORD pg_dump \
  -h localhost -U origina -d origina \
  --format=custom --compress=9 \
  -f "$BACKUP_DIR/origina_$TIMESTAMP.dump"

# Keep last 30 days
find "$BACKUP_DIR" -name "*.dump" -mtime +30 -delete

echo "Backup complete: origina_$TIMESTAMP.dump"
SCRIPT

sudo chmod +x /usr/local/bin/origina-backup.sh

# Schedule daily backup at 3 AM
echo "0 3 * * * root /usr/local/bin/origina-backup.sh" | sudo tee /etc/cron.d/origina-backup
```

### Restore from Backup

```bash
pg_restore -h localhost -U origina -d origina \
  --clean --if-exists \
  /var/backups/origina/origina_YYYYMMDD_HHMMSS.dump
```

---

## Monitoring

### Health Endpoint

The server exposes `/api/health` which returns:

```json
{
  "status": "ok",
  "uptime": 12345,
  "timestamp": "2026-02-21T06:00:00.000Z",
  "services": {
    "postgres": true,
    "redis": true
  }
}
```

### UptimeRobot / External Monitoring

1. Create a monitor pointing to `https://origina.io/api/health`
2. Check interval: 60 seconds
3. Alert on HTTP status != 200 or response time > 5s

### PM2 Monitoring

```bash
# Real-time monitoring
pm2 monit

# PM2 Plus (optional SaaS dashboard)
pm2 link <secret> <public>
```

---

## Updating

```bash
cd /var/www/origina

# Pull latest
git pull origin main

# Install dependencies
npm install
cd server && npm install && cd ..

# Build
npm run build
cd server && npm run build && cd ..

# Run any new migrations
for f in server/src/db/migrations/*.sql; do
  PGPASSWORD=$PG_PASSWORD psql -h localhost -U origina -d origina -f "$f" 2>/dev/null
done

# Zero-downtime reload
pm2 reload origina
```

---

## Troubleshooting

### App won't start
```bash
# Check PM2 logs
pm2 logs origina --lines 50

# Check environment
pm2 env 0 | grep -E 'NODE_ENV|PORT|PG_|REDIS_'

# Test database connection
PGPASSWORD=$PG_PASSWORD psql -h localhost -U origina -d origina -c "SELECT 1"

# Test Redis connection
redis-cli -h $REDIS_HOST -p $REDIS_PORT -a $REDIS_PASSWORD ping
```

### Nginx 502 Bad Gateway
```bash
# Check if app is running
pm2 status

# Check nginx config
sudo nginx -t

# Check nginx error log
sudo tail -20 /var/log/nginx/error.log

# Check if port is in use
sudo lsof -i :3001
```

### Redis connection refused
```bash
# For Redis Cloud — ensure REDIS_TLS=true and REDIS_USERNAME is set
# For local Redis — check service status
sudo systemctl status redis-server

# Test connection
redis-cli -h $REDIS_HOST -p $REDIS_PORT --tls -a $REDIS_PASSWORD ping
```

### High memory usage
```bash
# PM2 auto-restarts at 512MB (configured in ecosystem.config.cjs)
# Check current memory
pm2 status

# Force restart all instances
pm2 reload origina
```

### SSL certificate renewal failed
```bash
# Test renewal
sudo certbot renew --dry-run

# Manual renewal
sudo certbot renew

# Reload nginx after renewal
sudo systemctl reload nginx
```
