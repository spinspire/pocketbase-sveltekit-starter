---
name: docker
description: Docker Compose conventions — short service names, no root, no host ports in base compose, override files for local customisations.
---

# Docker Compose conventions

Apply these conventions when creating or modifying `docker-compose.yml`.

## Principles

1. **`.env` (git-ignored) + `.env.example` (checked in, with doc comments).**  
   All secrets and environment-specific values live in `.env`. The example file documents each variable.

2. **No root.**  
   Every service that doesn't need root gets `user: "${UID:-1000}:${GID:-1000}"`.  
   - Dockerfiles must make the working directory group-writable (`RUN chmod g+w .`).  
   - Postgres is exempt — its official image handles user switching.

3. **No port forwarding in the base compose file.**  
   `ports:` only appear in override files. The base file exposes nothing to the host.

4. **Override file (example only).**  
   Write `docker-compose.override-example.yml` with documented, commented-out options.  
   Users copy it to `docker-compose.override.yml` (git-ignored) for their local customisations.  
   Never write `docker-compose.override.yml` into the project — only the example.

5. **Lightweight images.**  
   Prefer `-alpine` or `-slim` variants.

6. **Named project.**  
   Set `name:` at the top so volumes and containers are predictable. Or use COMPOSE_PROJECT_NAME env var.

7. **Mandatory env vars.**  
   Use `${VAR:?required}` so compose errors immediately when a required variable is missing.

8. **Short service names.**  
   `pg`, `bun`, `ml`, `py`, `sk` (SvelteKit), `pb` (PocketBase), etc. If there's a "primary" app, their service should be named `app`.

9. **Restart policy.**  
   `restart: unless-stopped` for long-lived services, `on-failure:N` for batch jobs. Never use `always` (it reanimates after intentional `docker compose stop`).

10. **Read-only root.**  
    `read_only: true` on every service that doesn't need to write to its own filesystem. Mount `tmpfs` for paths that must be writable (`/tmp`, `/run`). Combine with `tmpfs` for the writable paths the app actually needs.

11. **Log rotation.**  
    Every service gets `logging.driver: json-file` with `max-size: 10m` and `max-file: 3`. Prevents disk fills.

12. **Pin images.**  
    Never `:latest` — use explicit version tags or digests. Reproducible builds.

## Patterns

### Base compose
```yaml
name: prj

services:
  app:
    build: .
    image: prj-app
    user: "${UID:-1000}:${GID:-1000}"
    environment:
      DB_URL: postgres://${POSTGRES_USER}:${POSTGRES_PASSWORD}@pg:5432/${POSTGRES_DB}
    depends_on:
      pg:
        condition: service_healthy

  pg:
    image: postgres:17-alpine
    environment:
      POSTGRES_USER: ${POSTGRES_USER:?required}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:?required}
      POSTGRES_DB: ${POSTGRES_DB:?required}
    volumes:
      - pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER} -d ${POSTGRES_DB}"]
      interval: 5s
      timeout: 5s
      retries: 5

volumes:
  pgdata:
```

### Override example
```yaml
# docker-compose.override.yml
services:
  pg:
    ports:
      - "127.0.0.1:5432:5432"

  app:
    ports:
      - "127.0.0.1:8000:8000"
    volumes:
      - ./src:/app/src:ro
```

### Dockerfile — writable working dir
```dockerfile
WORKDIR /app
RUN chmod g+w .
```

### `.env.example`
```sh
# ── Section ────────────────────────────────────────────────────────
# Description of what this is for.
VAR_NAME=default-value
```

## Production checklist

Before deploying, verify:

- [ ] `restart: unless-stopped` on every long-lived service
- [ ] `deploy.resources.limits.memory` + `cpus` set per service
- [ ] Health checks on all services with `start_period`
- [ ] `depends_on` uses `condition: service_healthy` where needed
- [ ] `read_only: true` + `tmpfs` for writable paths
- [ ] `user:` set to non-root on every non-Postgres service
- [ ] No `:latest` — all images pinned to versions or digests
- [ ] Log rotation configured (`max-size` / `max-file`)
- [ ] `.env` in `.gitignore`, `.env.example` checked in
- [ ] `name:` set at top of compose file
- [ ] No `ports:` in base compose (use override files)
- [ ] `cap_drop: ALL` + specific `cap_add` + `no-new-privileges:true`
- [ ] Backend/internal networks use `internal: true`
