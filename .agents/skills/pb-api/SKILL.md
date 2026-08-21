---
name: pb-api
description: Operate PocketBase via its REST API. Use for CRUD operations on collections, authentication, querying records with filters, and managing PocketBase data.
license: MIT
authors: "SpinSpire Team"
allowed-tools: Bash, curl
---

# PocketBase API

Reference: https://pocketbase.io/docs/

Operate PocketBase via its REST API.

## Credentials

Create `.env` from `.env.example` (never commit `.env`):

```bash
PB_URL=http://localhost:8090
PB_SUPERUSER_EMAIL=admin@example.com
PB_SUPERUSER_PASSWORD=your-password
```

If credentials aren't available via env vars, ask user explicitly before proceeding.

## Quick Start

```bash
# Auth
curl -X POST http://localhost:8090/api/collections/_superusers/auth \
  -H 'Content-Type: application/json' \
  -d '{"identity":"admin@example.com","password":"secret"}'

# List records
curl http://localhost:8090/api/collections/posts/records \
  -H 'Authorization: Bearer TOKEN'

# Filter records
curl "http://localhost:8090/api/collections/posts/records?filter=status='published'&sort=-created&expand=author"
```

## Key Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/collections/:collection/auth` | Auth with password |
| POST | `/api/collections/:collection/auth-with-password` | Login |
| GET | `/api/collections/:collection/records` | List records |
| POST | `/api/collections/:collection/records` | Create record |
| PATCH | `/api/collections/:collection/records/:id` | Update record |
| DELETE | `/api/collections/:collection/records/:id` | Delete record |

## Filter Syntax

```
status = 'published'
author.id = 'abc123'
created >= '2024-01-01'
user.name ~ 'john*'
```

Use `@collection.name.field` for cross-collection filters.

## SDK Usage

```typescript
import PocketBase from 'pocketbase'

const pb = new PocketBase('http://localhost:8090')
await pb.collection('posts').authWithPassword('user@test.com', 'secret')

// List with filter
const records = await pb.collection('posts').getList(1, 50, {
  filter: "status = 'published'",
  sort: '-created',
  expand: 'author,tags'
})
```

## API Rules

- `null` → superuser only
- `""` → public access
- Start locked, open selectively
- Use `@request.auth`, `@collection`, `@now` in rules