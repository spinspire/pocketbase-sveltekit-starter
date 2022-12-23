# PocketBase / SvelteKit Starter App

Use this app as a starting point for your own _customized_
[PocketBase](https://pocketbase.io/) backend
with [SvelteKit](https://kit.svelte.dev) frontend.
This is a high-performance frontend+backend combination since frontend
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

# Setup

Follow these step EXACTLY, or else it won't work.

1. Follow [./backend/README.md](./backend/README.md)
2. Follow [./frontend/README.md](./frontend/README.md)

# Developing

After you've done the setup in the above two README files, run
the backend and the frontend in dev mode.

```bash
npm run backend:dev
npm run dev
```

Now making changes in the Svelte code (frontend) or Go code (backend) will show
results (almost) immediately.

# Usage

To use the app as a user / tester ...

- visit the frontend URL (e.g. http://localhost:5173)
- Navigate around. The Home page is not very interesting.
- The `hello` page shows and example of frontend calling a custom backend API implemented in Go.
- The `posts` page shows all existing posts. If that page is empty, then you might want to create some posts. You must be logged in to be able to create posts.
- Into the `Login` form, you can enter an existing username/password, or check the `register` checkbox to create a new account (it registers the user and log in immediately).

The above are just some sample features. Now go ahead and implement all kinds of new features.

- Create new collections.
- Create new pages that manipulate the above collections.

# Building

See the build process details in the README files for backend and frontend.

# Configurable Hooks

Please read about the "hooks" system in [./backend/README.md](./backend/README.md)
It is a very easy and powerful way to extend your application with minimal
configuration and perhaps no code.

# Feedback

Please provide feedback by
[opening an issue](https://github.com/spinspire/pocketbase-sveltekit-starter/issues/new)
or
[starting a discussion](https://github.com/spinspire/pocketbase-sveltekit-starter/discussions).
