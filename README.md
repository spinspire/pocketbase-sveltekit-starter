# PocketBase / SvelteKit Demo App

Shows how to use _customized_ [PocketBase](https://pocketbase.io/) as a backend
to [SvelteKit](https://kit.svelte.dev) frontend.
This is a super high-performance frontend+backend combination since frontend
is static and backend is a single compiled Golang binary (JAMstack).

- SvelteKit frontend is fully static, client-side only so that here is no need
  for NodeJS at runtime. It is generated using [`adapter-static`](https://github.com/sveltejs/kit/tree/master/packages/adapter-static)
- PocketBase provides complete (and _fast_) backend including:
  - databse (SQLite)
  - CRUD API for database
  - realtime subscriptions for LIVE data (server push to browser)
  - Authentication and Authorization (email + social login)
  - file storage (local filesystem or S3)
- PocketBase can be downloaded as binary. But if you want to extend it with
  custom Golang code then code is included to compile it locally with
  extensions such as custom endpoints (e.g. `/api/hello`) and database event
  hooks (e.g. executing Go handler functions when a database row is created)

## Setup

1. Download the latest `pocketbase` release from
   https://github.com/pocketbase/pocketbase/releases/latest
   and put it in `backend/pocketbase`. Or if you want to customize pocketbase
   then see instructions in the `backend` folder.
2. Install frontend dependencies with `pnpm install` (or `npx pnpm install`)
   in the `frontend` folder.

## Developing

In the `frontend` folder, to start a development server:

```bash
npm run dev
```

## Building

To create a production version of your app:

```bash
npm run build
```

Now you can serve production compiled version of the frontend using the backend
or any static file web server. You can preview the production build with
`npm preview`.
