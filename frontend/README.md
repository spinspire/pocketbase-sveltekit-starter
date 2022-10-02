# Static SvekteKit frontend for PocketBase backend

## Setup

```bash
cp .env.example .env # and then edit it to taste
npx pnpm install
```

## Developing

```bash
# make sure backend is running
npm run dev:backend
# and then ...
npm run dev
```

## Building

To create a production version of your app (static HTML/JS app):

```bash
# make sure backend is running
npm run backend
# and then ...
npm run build
```

Now you can serve production compiled version of the frontend using the backend
or any static file web server. You can preview the production build with
`npm preview`.
