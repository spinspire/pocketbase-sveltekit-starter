# Agents

**Always read `pb/README.md`** for backend-specific context.

## Project Structure

- **pb/** — PocketBase backend (Go binary + JS hooks). Owns the SQLite DB, auth, file storage, and custom API routes.
- **sk/** — SvelteKit frontend. Fully static (`adapter-static`), SSR off. No Node/Bun needed at runtime.
- Single Docker container runs both services; start with `docker compose up -d`.

## DEV Mode

The container runs in dev mode by default (`DEV=true` in docker-compose.yml).

- **DEV=true**: Entrypoint starts Vite (`bun run dev`) in background before PocketBase.
  - Vite on `localhost:5173` with HMR for SvelteKit edits.
  - Vite proxies `/api` and `/_` to PocketBase (via `POCKETBASE_URL`, default `http://127.0.0.1:8090`).
  - PocketBase serves API + admin UI on `localhost:8090`.
- **DEV=false** or unset: Only PocketBase runs, serving pre-built `sk/build/` on `localhost:8090`. No Vite, no HMR.

Port mapping requires `docker-compose.override.yml` (see `docker-compose.override-example.yml`).

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for production setup: VPS, Cloudflare proxy, S3/R2 file storage, Litestream replication, email, and security hardening.

## Key Commands

```bash
# Start everything (dev mode with HMR)
docker compose up -d

# Start in prod mode (no Vite, serves built files)
# Set DEV=false in .env, then:
docker compose up -d

# Frontend only (without Docker)
cd sk && bun run dev

# Backend only (Go live reload via modd)
cd pb && modd

# Build frontend (produces sk/build/)
cd sk && bun run build

# Regenerate TypeScript types after schema change
cd sk && bun run typegen

# Lint / format / typecheck frontend
cd sk && bun run lint
cd sk && bun run format
cd sk && bun run check
```

## Docker / Release Modes

- `RELEASE=standard` (default): downloads PocketBase binary from GitHub at version `PB_VERSION`.
- `RELEASE=custom`: builds Go binary from `pb/main.go` using `modd` for live reload.
- Set in `.env` or override in `docker-compose.override.yml`.

## PocketBase

- **Migrations**: `pb/pb_migrations/*.js` run automatically on startup (`--automigrate=false` in docker, manual via `pocketbase migrate up`).
- **JS hooks**: `pb/pb_hooks/*.pb.js` — onRecord* callbacks. Changes auto-reload (hooksWatch=true).
- **Go hooks** (commented out in main.go): use `pb/pb_hooks/auditlog.pb.js` instead.
- **Custom Go endpoints**: registered in `pb/main.go` (e.g. `/api/go-hello`).
- **Custom JS endpoints**: `pb/pb_hooks/main.pb.js` — `/api/hello`, `/api/sendmail`, `/api/config`, `/api/generate`.
- **Audit logging**: controlled by `AUDITLOG` env var (e.g. `AUDIOGLOG=posts,users`). JS implementation in `pb/pb_hooks/auditlog.pb.js`.
- Admin UI: `http://localhost:8090/_`

System collections: `_mfas`, `_otps`, `_externalAuths`, `_authOrigins`, `_superusers`
App collections: `users`, `posts`, `auditlog`, `hooks`, `passkeys`

## SvelteKit

- TypeScript types auto-generated from PB schema: `sk/src/lib/pocketbase/generated-types.ts`. Regenerate after collections change.
- Frontend served by PocketBase via `--publicDir ../sk/build`.

## Oat-css Gotchas

- **`title` on `<i class="bi-*">` breaks Bootstrap Icons**: Oat-css JS converts `title` → `data-tooltip`, which sets `display: block` on the element, collapsing the icon to 0×0. Never use `title` on icon elements. (Tested: ref-ui `/ref-ui` icons section.)
- **`<span>` vs `<i>` for icons**: Oat-css sets `display: block` on `<span>` elements. Always use `<i>` for Bootstrap Icons.
- **Scoped CSS `:where()` has 0 specificity**: Svelte's scoped styles use `:where(.hash)` which loses to oat-css rules. Use `!important` or global selectors when overriding oat-css.
- **`<a role="button">` ignores oat button classes**: Oat link styles override `outline`/`ghost` classes on `<a>`. Use a `.toolbar` wrapper with explicit styles for consistent appearance.

## Browser Testing

- **URL**: `http://<CONTAINER_HOSTNAME>:5173/` — get hostname via `docker compose ps --format '{{.Name}}'` (NOT localhost)
- **PB API** accessible via Vite proxy at same host: `http://pbsk-pb-1:5173/api/...`
- **Auth tokens** (reusable across sessions):
  - Regular user: `cat ./tmp/user_token` — `user@example.com` / `changeme123` (collection: `users`)
  - Superuser: `cat ./tmp/admin_token` — `admin@example.com` / `changeme123` (collection: `_superusers`)
- **Set auth in browser**: 
  ```bash
  # Get full auth response with record
  curl -s http://pbsk-pb-1:5173/api/collections/users/auth-with-password \
    -X POST -H 'Content-Type: application/json' \
    -d '{"identity":"user@example.com","password":"changeme123"}' | \
    jq -c '{token: .token, record: .record}' > ./tmp/user_auth.json
  
  # Set in localStorage (PB JS SDK uses key "pocketbase_auth")
  AUTH_JSON=$(cat ./tmp/user_auth.json)
  agent-browser eval "localStorage.setItem('pocketbase_auth', '$AUTH_JSON')"
  agent-browser reload
  ```