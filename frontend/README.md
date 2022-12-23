# Static SvekteKit frontend for PocketBase backend

## Setup

```bash
cp .env.example .env # and then edit it to taste
npx pnpm install
```

## Developing

```bash
# if the backend is not already running ...
npm run dev:backend
# and then start the frontend ...
npm run dev
```

## Building

To create a production version of your app (static HTML/JS app):

_NOTE_: The build below will fail unless the backend has at least 1
post created. So please create a "posts" record using the app UI or
the admin UI before running build below.

```bash
# make sure backend is running
npm run backend
# and then ...
npm run build
```

The above generates output in the `build` folder. Now you can serve production compiled version of the frontend using the backend (with `--publicDir ../frontend/build`), any static file web server, or `npm preview`.