# Static SvekteKit frontend for PocketBase backend

## Setup

```bash
npx pnpm install # install dependencies
npm run build # compile frontend
```

The above produces `build` output directory which is then used by PocketBase to serve the frontend of your app.

## Live Development

```bash
# start the backend, if not already running ...
npm run dev:backend
# and then start the frontend ...
npm run dev
```

Now visit http://localhost:5173 (sk) or http://localhost:8090 (pb)

## Generated Types

The file `generated-types.ts` contains TypeScript definitions of `Record` types mirroring the fields in your database collections. But it needs to be regenerated every time you modify the schema. This can be done by simply running the `typegen` script in the frontend's `package.json`. So remember to run `npm run typegen` after every schema change.

## Building

To create a production version of your app (static HTML/JS app):

_NOTE_: The build below will fail unless the backend has at least 1
post created. So please create a "posts" record using the app UI or
the admin UI before running build below.

```bash
# compile frontend
npm run build
# and then serve it with pocketbase
npm run backend
```

The above generates output in the `build` folder. Now you can serve production compiled version of the frontend using the backend (with `--publicDir ../frontend/build`), any static file web server, or `npm preview`.
