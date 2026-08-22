# Deployment Guide

This project deploys as a single Docker container running both PocketBase and the SvelteKit frontend. Total resource footprint: ~200MB RAM, ~500MB disk.

## Quick Start

```bash
# 1. Clone on your VPS
git clone <repo-url> && cd pocketbase-sveltekit-starter

# 2. Configure
cp .env.example .env
# Edit .env — set at minimum:
#   PB_SUPERUSER_EMAIL=you@yourdomain.com
#   PB_SUPERUSER_PASSWORD=changeme
#   DEV=false

# 3. Run
docker compose up -d
```

That's it. PocketBase serves the frontend at `http://YOUR_IP:8090`.

---

## Production Mode

Set `DEV=false` in `.env` (or `docker-compose.yml`). This disables the Vite dev server — PocketBase serves the pre-built `sk/build/` directly. No Node/Bun needed at runtime.

```bash
# Build frontend first (on your dev machine)
cd sk && bun run build

# Then deploy — pb serves sk/build/ automatically
docker compose up -d
```

---

## VPS Requirements

Any Linux VPS with Docker works. Minimum specs: 256MB RAM, 1 vCPU, 1GB disk. Anything in the $4–6/mo range is plenty.

For options, see [lowendbox.com](https://lowendbox.com/) — community-curated cheap VPS deals.

---

## Domain & Cloudflare Proxy

### 1. Point DNS to your VPS

In Cloudflare DNS, add an A record:

```
Type  Name  Content     Proxy
A     app   1.2.3.4     Proxied (orange cloud)
```

### 2. Configure PocketBase to trust Cloudflare

Cloudflare proxies change the apparent client IP. PocketBase needs to know which headers to trust for real visitor IPs.

**Option A: Environment variable (recommended)**

```yaml
# docker-compose.yml
environment:
  - PB_TRUSTED_PROXIES=173.245.48.0/20,103.21.244.0/22,...
```

Get Cloudflare's IP ranges from https://www.cloudflare.com/ips/

**Option B: Dashboard settings**

After first run, go to `/_/` → Settings → Application → Realtime and set trusted proxy headers to `X-Forwarded-For`.

### 3. SSL/TLS

**With Cloudflare:** Set SSL mode to **Full (Strict)** in Cloudflare → SSL/TLS. Cloudflare handles termination. No cert config needed on the VPS.

**Without Cloudflare — Traefik + Let's Encrypt:**

If you're not using Cloudflare's proxy, put Traefik in front for automatic HTTPS:

```yaml
# docker-compose.yml
services:
  traefik:
    image: traefik:v3.1
    command:
      - "--providers.docker=true"
      - "--entrypoints.web.address=:80"
      - "--entrypoints.websecure.address=:443"
      - "--certificatesresolvers.le.acme.httpchallenge=true"
      - "--certificatesresolvers.le.acme.httpchallenge.entrypoint=web"
      - "--certificatesresolvers.le.acme.email=you@yourdomain.com"
      - "--certificatesresolvers.le.acme.storage=/letsencrypt/acme.json"
      - "--entrypoints.web.http.redirections.entrypoint.to=websecure"
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./letsencrypt:/letsencrypt
      - /var/run/docker.sock:/var/run/docker.sock:ro

  pb:
    build: .
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.pb.rule=Host(`app.yourdomain.com`)"
      - "traefik.http.routers.pb.entrypoints=websecure"
      - "traefik.http.routers.pb.tls.certresolver=le"
      - "traefik.http.services.pb.loadbalancer.server.port=8090"
```

PocketBase behind a reverse proxy must trust forwarded headers:

```yaml
environment:
  - PB_TRUSTED_PROXIES=172.18.0.0/16
```

---

## File Storage: Cloudflare R2 (or S3)

By default, uploaded files live in `pb_data/storage/`. For production, use S3-compatible blob storage so files survive container rebuilds and benefit from CDN delivery.

### Cloudflare R2 (free egress)

1. Create an R2 bucket in the Cloudflare dashboard
2. Generate an API token with R2 read/write permissions
3. In PocketBase dashboard → Settings → Files → Storage:

```
File URL base:     https://pub-<YOUR_R2_SUBDOMAIN>.r2.dev
S3 endpoint:       https://<YOUR_ACCOUNT_ID>.r2.cloudflarestorage.com
S3 access key:     <your-r2-access-key>
S3 secret key:     <your-r2-secret-key>
S3 bucket:         <your-bucket-name>
S3 region:         auto
```

Or set via environment variables:

```yaml
environment:
  - PB_FILE_STORAGE_S3=true
  - PB_FILE_STORAGE_S3_BUCKET=your-bucket
  - PB_FILE_STORAGE_S3_ENDPOINT=https://<account-id>.r2.cloudflarestorage.com
  - PB_FILE_STORAGE_S3_ACCESS_KEY=your-key
  - PB_FILE_STORAGE_S3_SECRET_KEY=your-secret
  - PB_FILE_STORAGE_S3_REGION=auto
```

### Other S3 providers

AWS S3, Backblaze B2, MinIO, Wasabi — any S3-compatible service works with the same settings. Adjust the endpoint URL accordingly.

---

## Live Replication: Litestream

[Litestream](https://litestream.io/) streams SQLite changes to S3-compatible storage, enabling point-in-time recovery. The recommended backup strategy for single-server deployments.

### Setup (single container with `-exec`)

Litestream wraps and supervises your PocketBase process. It watches the SQLite DB and streams WAL changes to S3 continuously.

**Option A: With config file (recommended)**

Create `litestream.yml` in your project root:

```yml
dbs:
  - path: /app/pb/pb_data/data.db
    replica:
      url: s3://your-bucket/backups/pb_data.db
      # For R2/MinIO/etc, add:
      # endpoint: https://<account-id>.r2.cloudflarestorage.com
      # access-key-id: YOUR_KEY
      # secret-access-key: YOUR_SECRET
```

Update Dockerfile entrypoint to launch via Litestream:

```dockerfile
# Replace the final CMD with:
CMD ["litestream", "replicate", "-exec", "/app/pocketbase serve --http=0.0.0.0:8090"]
```

Pass S3 credentials via env vars:

```yaml
environment:
  - LITESTREAM_ACCESS_KEY_ID=your-key
  - LITESTREAM_SECRET_ACCESS_KEY=your-secret
```

**Option B: Inline command (no config file)**

```dockerfile
CMD ["litestream", "replicate", "-exec", "/app/pocketbase serve --http=0.0.0.0:8090", \
  "/app/pb/pb_data/data.db", "s3://your-bucket/backups/pb_data.db"]
```

### Restore

```bash
# 1. Stop the container
docker compose stop pb

# 2. Restore from S3
docker run --rm \
  -e LITESTREAM_ACCESS_KEY_ID=your-key \
  -e LITESTREAM_SECRET_ACCESS_KEY=your-secret \
  -v pb_data:/app/pb/pb_data \
  litestream/litestream \
  restore -o /app/pb/pb_data/data.db s3://your-bucket/backups/pb_data.db

# 3. Restart
docker compose start pb
```

### Alternative: Built-in backups

PocketBase has built-in backup/restore via the dashboard (Settings → Backups). Backups can be stored locally or in S3. Schedule via cron for automation.

---

## Email Sending

PocketBase uses Unix `sendmail` by default — fine for dev, but emails will land in spam in production. Configure an SMTP provider.

### Recommended providers (free/cheap tiers)

| Provider | Free tier | Notes |
|----------|-----------|-------|
| [Brevo](https://www.brevo.com/) | 300 emails/day | Easy setup, good deliverability |
| [Mailgun](https://www.mailgun.com/) | 100 emails/day | Developer-friendly API |
| [AWS SES](https://aws.amazon.com/ses/) | 62K emails/mo from EC2 | Cheapest at scale |
| [Resend](https://resend.com/) | 3K emails/mo | Modern API, React Email |
| [SMTP2GO](https://www.smtp2go.com/) | 1K emails/mo | Good for NZ/AU regions |

### Configuration

Dashboard → Settings → Mail settings:

```
SMTP host:     smtp.mailgun.org    (or your provider's SMTP host)
SMTP port:     587
SMTP username: postmaster@mg.yourdomain.com
SMTP password: <your-smtp-password>
Sender email:  noreply@yourdomain.com
Sender name:   Your App Name
```

Set the same values via environment variables:

```yaml
environment:
  - PB_MAILER_SMTP_HOST=smtp.mailgun.org
  - PB_MAILER_SMTP_PORT=587
  - PB_MAILER_SMTP_USERNAME=postmaster@mg.yourdomain.com
  - PB_MAILER_SMTP_PASSWORD=your-password
  - PB_MAILER_AUTHENTICATED=noreply@yourdomain.com
```

### DNS records for deliverability

Add these to your domain's DNS (in Cloudflare):

```
SPF:    TXT   @    "v=spf1 include:mailgun.org ~all"
DKIM:   TXT   mail._domainkey   "v=DKIM1; k=rsa; p=..."
DMARC:  TXT   _dmarc            "v=DMARC1; p=none; rua=mailto:you@yourdomain.com"
```

Your SMTP provider will give you the exact DKIM value.

---

## Security Hardening

### Superuser IP whitelist (v0.38+)

Lock down admin UI access to your IP(s):

```
Dashboard → Settings → Application → Superuser IPs
```

If locked out, reset via CLI:

```bash
docker compose exec pb /app/pb/pocketbase superuser ips 1.2.3.4
```

### Rate limiting

Enable in Dashboard → Settings → Application → Rate limiting. Defaults are reasonable for most apps.

### MFA for superusers

Enable MFA/OTP on the `_superusers` collection for an extra auth layer.

### Settings encryption at rest

PocketBase stores app settings (SMTP password, S3 keys, etc.) as plain JSON in SQLite. If someone gets your database file, they can read those secrets. The `--encryptionEnv` flag encrypts all settings at rest:

```bash
# 1. Generate a 32-character key
openssl rand -base64 32

# 2. Set it as an env var
export PB_ENCRYPTION_KEY="2fSolc9inLl3UxRDW5waUQuBffSg60HH"

# 3. Start PocketBase pointing to that env var
pocketbase serve --encryptionEnv=PB_ENCRYPTION_KEY
```

In Docker Compose:

```yaml
environment:
  - PB_ENCRYPTION_KEY=2fSolc9inLl3UxRDW5waUQuBffSg60HH
command: pocketbase serve --http=0.0.0.0:8090 --encryptionEnv=PB_ENCRYPTION_KEY
```

Once enabled, do not lose the key — encrypted settings cannot be recovered without it.

---

## SQLite Performance

PocketBase v0.32+ defaults `PRAGMA cache_size` to ~32MB — good for most workloads. For high-traffic sites:

```bash
# Check current settings
docker compose exec pb sqlite3 /app/pb/pb_data/data.db "PRAGMA cache_size;"
```

No tuning usually needed unless you have 10K+ concurrent users.

---

## Monitoring & Operations

### Health check

```bash
# API ping
curl -s http://localhost:8090/api/health

# Admin UI
curl -s -o /dev/null -w "%{http_code}" http://localhost:8090/_/
```

### Logs

```bash
# Docker logs
docker compose logs -f pb

# PocketBase also writes to stdout/stderr
```

### Restart policy

Docker Compose defaults to `restart: unless-stopped` — container restarts on crash but not after manual `docker compose stop`. For most production use cases, the default is fine.

### Schema migrations

`automigrate=false` in this project's Dockerfile. In production:

```bash
# After deploying new code with schema changes:
docker compose exec pb /app/pb/pocketbase migrate up
```

---

## Full docker-compose.yml Example

```yaml
services:
  pb:
    build: .
    restart: unless-stopped
    ports:
      - "8090:8090"
    environment:
      - DEV=false
      - PB_SUPERUSER_EMAIL=admin@yourdomain.com
      - PB_SUPERUSER_PASSWORD=changeme
    volumes:
      - pb_data:/app/pb/pb_data

volumes:
  pb_data:
```

Add `PB_TRUSTED_PROXIES` if behind a reverse proxy or Cloudflare.

---

## Checklist

- [ ] `DEV=false` in production
- [ ] Strong superuser password
- [ ] Cloudflare proxy enabled (orange cloud)
- [ ] Superuser IP whitelist configured
- [ ] Rate limiter enabled
- [ ] SMTP configured (not using sendmail)
- [ ] SPF/DKIM/DMARC DNS records added
- [ ] S3/R2 configured for file storage (or backups)
- [ ] Litestream running (or backup schedule set)
- [ ] `automigrate=false` (already set in Dockerfile)
