---
name: code-reuse
description: Use when building a UI component, PocketBase hook, page, or app feature and there is proven code to copy from the reference repos. Check here BEFORE writing UI components, PB hooks/routes, form controls, dialogs, auth flows, pagination, or realtime stores from scratch. Catalogs reusable code from pocketbase-sveltekit-starter (sk/src/lib + pb/pb_hooks) and spinspire/recipes. Components are proven but may need adaptation to the current project (runes, oat-css, $app/state).
authors: "Jitesh Doshi"
allowed-tools: Read, Glob, Grep, Bash
---

# Code Reuse

Proven, copy-ready code catalog from reference repos. **Reuse before building from scratch.**

## Sources

| Repo | What to copy | Where it lives |
|---|---|---|
| **pocketbase-sveltekit-starter** | Frontend lib + components + PB JS hooks | `sk/src/lib`, `pb/pb_hooks` |
| **spinspire/recipes** | Frontend lib + components playground + multi-stack templates | `sk/`, `pb/`, `py/`, `rs/` |

> **⚠️ Adapt, don't paste.** These use SCSS + box-icons + `$app/stores` + some legacy `export let`. Convert: `$app/stores` → `$app/state`, SCSS → oat-css/`app.css` tokens, `export let` → runes (`$props`/`$state`/`$derived`). They are proven patterns, not drop-in code.

---

## 1. pocketbase-sveltekit-starter — frontend lib (`sk/src/lib`)

### Core PB client (`pocketbase/index.ts`)

- **`client`** — typed PocketBase instance (same-origin by default).
- **`authModel`** — readable store on `client.authStore.onChange`; calls `invalidateAll()` on auth flips.
- **`login(email, password, register?, rest?)`** — create-if-register then `authWithPassword`.
- **`logout()`** — `authStore.clear()`.
- **`save<T>(collection, record, create?)`** — generic create/update; auto-converts to FormData when a value is `File`/`FileList` (via `object2formdata`). Use for file uploads.
- **`watch<T>(idOrName, queryParams?, page?, perPage?, realtime?)` → `PageStore<T>`** — realtime paginated list store: subscribes to `subscribe("*")`, maintains `result.items` (update=replace, create=append, delete=filter). `PageStore` adds `setPage()`/`next()`/`prev()`; unsubscribe tears down realtime. **Good upgrade candidate for our host pool/queue lists.**
- **`providerLogin(provider, authCollection)`** — OAuth2 login that backfills `name`/`avatar` from `meta`.
- **`webauthnRegister/Login`** — passkey flow via `@simplewebauthn/browser` + `/api/webauthn/*` routes.

### `pocketbase/ui.ts`

- **`alertOnFailure(request)`** — wraps a PB request; surfaces top-level `message` + per-field `data` errors via `alerts.error()`.

### `pocketbase/` components

| Component | Purpose |
|---|---|
| `FileField.svelte` | File-field rows with bindable `toBeRemoved` toggle-delete; links via `client.files.getURL`. |
| `Image.svelte` | PB file image with `{ thumb }` param + fallback (internal SVG or via.placeholder.com). |
| `ImgModal.svelte` | Thumb → full-size image lightbox in a `Dialog`. |
| `Paginator.svelte` | `« page X of Y »` pager bound to a `PageStore`. |

### `components/` — UI building blocks

| Component | Purpose |
|---|---|
| `Alerts.svelte` | Global toasts. Exports `alerts` object (`info/success/warning/error`, timeout, `html`); auto-catches unhandled promise rejections. Place once in layout. |
| `Dialog.svelte` | Native `<dialog>` modal; `trigger` snippet gets `show`; closes on backdrop click. |
| `Link2Modal.svelte` | Internal link → modal via `preloadData`+`pushState`+`<dialog>`; `invalidateAll`+`history.back()` on close. |
| `LoginGuard.svelte` | Conditional render on auth (and admin via `isSuperuser`); `otherwise` snippet + optional redirect. |
| `LoginForm.svelte` | Sign-in/up tabs, admin checkbox, passkey, OAuth buttons from `listAuthMethods()`. |
| `LoginBadge.svelte` | Auth pill (avatar+name) → Dialog with passkey register / sign out, or sign-in. |
| `Nav.svelte` | Top nav with active highlighting. |
| `Delete.svelte` | Confirm-and-delete form; navigates after `collection.delete(id)`. |
| `FileInput.svelte` | Styled file input with paste capture + filename list snippet. |
| `DateShow.svelte` | Circular date badge (DOW / mon+day / year). |
| `LocalStorageStore.svelte` | Module `ls` store mirroring localStorage (JSON-parsed) + debug table. |
| `RadioText.svelte` | Pill radio selector; object or string-array `choices`; hides inputs, `:has()` styling. |
| `Spinner.svelte` | CSS spinner; also exports `activityStore(f)` (store with `.run()`). |
| `Stepper.svelte` | Step indicator; children snippet gets `{data, index, total, step, next, previous}`. |
| `TabGroup`/`Tab`/`TabContent.svelte` | Tabs via context `active` store. |
| `ToggleText.svelte` | Pure-CSS two-label toggle. |

### `metadata.ts`

- `writable({ title, headline, description })` global metadata store.

---

## 2. pocketbase-sveltekit-starter — PB JS hooks (`pb/pb_hooks`)

### `main.pb.js` patterns

- **`routerAdd(method, path, handler, $apis.requireAuth())`** — custom routes. `/api/hello` (auth greeting), `/api/sendmail` (`$app.newMailClient()` + `record.ignoreEmailVisibility(true)`), `/api/config` (public, merges `config.json` via `require(`${__hooks}/util`)` + live settings), `/api/generate` (external HTTP + `$filesystem.fileFromURL` + `RecordUpsertForm`).
- **`onModelCreate/onModelUpdate(e, "collection")`** — model hooks scoped to a collection.

### `util.js` helpers (load via `require(`${__hooks}/util`)`)

- **`parseJSON(bytes)` / `parseJSONFile(path)`** — decode PB byte-array JSON from `$os.readFile`.
- **`slugDefault(obj)`** — set `slug` to `id` when empty.
- **`doAudit(event, request)`** — writes an `auditlog` record for collections in `AUDITLOG` env var; records collection/record/event/user/admin + `data` and `original` (changed keys only, via `record.original().publicExport()` diff).

### `auditlog.pb.js`

- `onRecordCreateRequest/UpdateRequest/DeleteRequest` → `e.next()` then `doAudit(...)`. **Pattern: let the operation run first, then audit.**

### `config.json`

- Static site config merged into `/api/config`.

---

## 3. spinspire/recipes — frontend + templates

### `sk/src/lib`

- `pocketbase/index.ts` (151 lines) — **trimmed variant** of the starter's: `client`, `authModel`, `save`+`object2formdata`, `watch`, `logout`. No webauthn. Uses `$app/paths` `base`.
- `pocketbase/*.svelte` — `Paginator`, `LoginGuard`, `LoginForm`, `LoginBadge`, `ImgModal` (simpler variants of the starter's).
- `components/*.svelte` — `Alerts`, `DateShow`, `Dialog`, `FileInput`, `Nav`, `Spinner` (subset of the starter's; same patterns).

### Component playground (`sk/src/routes/components/`)

A dev-only route that renders any `src/lib/components/*.svelte` in isolation with a live **exports editor**:

- `+layout.svelte` — lists all components via `import.meta.glob("/src/lib/components/**/*.svelte")`, links each to `/components/{path}`.
- `[...path]/+page.svelte` — dynamically `import()`s the component and renders it inside `ExportEditor`.
- `ExportEditor.svelte` — reads `component.$$.props`, renders an `Inputs` control per prop, binds values into a `bindings` object.
- `Inputs.svelte` — input control (text/number/date via `INPUT_TYPES` in `config.ts`) with `processor` hooks.
- `config.ts` — `remotePath` writable (VSCode remote link), `HTMLInputTypes` type, `INPUT_TYPES` map.
- `Remote.svelte` — form to configure the "Open in VSCode" path.

**Use case:** to quickly develop/test a component in isolation with interactive props. Pull the `components/` route folder into any SvelteKit project.

### `pb/` — PocketBase/Go template

- `main.go` — custom PB binary: `--publicDir` flag, SPA static serving, `jsvm.MustRegisterMigrations`, `migratecmd` (JS templates), `hooks.Register(app)`.
- `hooks/hooks.go` — Go audit-log + **event-driven actions**: reads a `hooks` collection (`collection/event/disabled`) and executes `command`/`post` actions against the record (JSON piped to stdin). Useful pattern for generic record-triggered automation.
- `entrypoint.sh` — build-if-needed (go build, tygo, modd) then `exec "$@"`.
- `tygo.yaml` — Go→TypeScript type generation config.
- `pb_migrations/*.js` — JS collection-snapshot migrations.

### `py/` (FastAPI) & `rs/` (Axum)

- `py/web.py` — minimal FastAPI with configurable prefix (`FASTAPI_PREFIX`, default `/apy`).
- `rs/` — Axum REST with SQLite (`db.rs`), file upload (`upload.rs`), experimental live-view (`live.rs`, `livecrud.rs`), static SPA serving.
- Only borrow these if we add a non-PB backend; otherwise skip.

### `docker-compose.yml` + `entrypoint.sh`

- Multi-service template (pb, py, rs, sk, mb) — non-root `${UID}:${GID}`, `expose` not `ports`, `entrypoint` initializes (builds) then runs the container command. Pattern matches our own docker setup.

### `.opencode/tools/sql.ts`

- A bun-based SQL tool for opencode (uses `bun:sqlite`/`@opencode-ai/plugin`); READONLY for safety. Only relevant if we adopt opencode tooling.

---

## When to use which source

- **UI components, dialogs, forms, toasts, tabs, pagination, realtime list stores, auth UI** → starter's `sk/src/lib` (richer; the recipes versions are trimmed copies).
- **Component playground / dev preview tool** → recipes `components/` route.
- **PB custom routes, model hooks, audit logging, config merging** → starter's `pb/pb_hooks`.
- **Record-triggered automation (command/post actions), custom PB Go build, FastAPI/Axum backends, multi-service compose** → recipes `pb/`, `py/`, `rs/`, `docker-compose.yml`.
- **Generic file upload create/update** → `save()`/`object2formdata` (both repos).

## Adaptation checklist (apply to every copy)

1. `$app/stores` → `$app/state` (`page` object, not store).
2. SCSS `<style>` → oat-css classes + tokens in `src/app.css` (`--brand`, `--glow`, `--muted-text`; NOT `--accent`/`--muted` which oat reserves).
3. box-icons `<i class="bx bx-*">` → inline SVG or text.
4. Legacy `export let`/`$:` → runes (`$props`, `$state`, `$derived`, snippets `{@render}`).
5. Rename `$derived` var `state` → `live` (svelte2tsx crash).
6. `client`/`pb` import path → `$lib/pb` (our app).
7. Collection names/fields → ours (`events`, `entries`, `users`).
8. Typecheck (`bun run check`) + tests (`bun test`) after adapting.
