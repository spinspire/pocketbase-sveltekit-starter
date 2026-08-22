---
name: pb-extend
description: Extend PocketBase with custom hooks and routes in JS or Go. Use when user wants to add custom API routes, modify PocketBase behavior, or add server-side logic.
allowed-tools: Bash
license: MIT
authors: "SpinSpire Team"
---

# PocketBase Extending

Reference: https://pocketbase.io/docs/js-overview/ | https://pocketbase.io/docs/go-overview/

Extend PocketBase with custom hooks and routes in JS or Go.

## JS Hooks (pb_hooks/)

Drop `*.pb.js` files in `pb_hooks/`:

```javascript
// pb_hooks/myhook.pb.js
/// <reference path="../pb_data/types.d.ts" />

router.api.post('/custom-route', async (e) => {
  const body = e.request.body
  // ... process
  return e.json({ result: 'ok' })
})

// On record create
onRecordCreateRequest((e) => {
  if (!e.record.get('email').endsWith('@company.com')) {
    return e.badRequest('Use company email')
  }
  return e.next()
})
```

**Rules:**
- Always call `e.next()` / `e.Next()` in hooks
- Variables outside handlers are undefined at runtime
- Use `require()` for shared config (CJS only, no ESM)

## Go Hooks (migrations/)

Versioned migrations in `migrations/`:

```go
package migrations

import (
  "github.com/pocketbase/pocketbase/migrations"
  "github.com/pocketbase/pocketbase/tools/types"
)

func init() {
  migrations.Register(func(app *pocketbase.App) error {
    // Custom logic
    return nil
  }, func(app *pocketbase.App) error {
    // Rollback logic
    return nil
  })
}
```

## Custom Routes

```javascript
// Add to pb_hooks
router.api.post('/api/myapp/send-email', async (e) => {
  const data = await e.request.json()
  await sendEmail(data.to, data.subject)
  return e.json({ sent: true })
}, middleware.RequireAuth())
```

## Key Hook Events

| Event | Purpose |
|-------|---------|
| `onRecordCreateRequest` | Before record creation |
| `onRecordUpdateRequest` | Before record update |
| `onRecordDeleteRequest` | Before record deletion |
| `OnRecordEnrich` | Shape response (incl. realtime) |
| `OnRecordRequest` | HTTP-only response shaping |
| `OnBeforeServe` | Modify router before serving |

## Migrations

**System fields**: Collections created via migration files **must** include `created` and `updated` system fields.

**Auto-migrate**: Collections changed via Admin UI auto-generate migrations in `pb_migrations/`

**Manual JS migration**:
```javascript
// pb_migrations/1700000000_seed_data.js
migrate((up, down) => {
  up((db) => {
    db.createCollection('categories', { /* ... */ })
  })
  down((db) => {
    db.dropCollection('categories')
  })
})
```

## Useful Settings

```javascript
// Read at runtime
const settings = require('../pb_settings/config.js')

// Access app in hooks
router.use(async (e) => {
  const app = e.app
  // ...
})
```