<script>
  import { resolve } from "$app/paths";
  import { metadata } from "$lib/metadata.js";

  const { data } = $props();
  $effect(() => {
    $metadata.title = "Home";
    $metadata.headline = `Welcome to ${data.config.site?.name}`;
  });
</script>

You've got the project running locally. Here's what you need to know to start building.

## What's here

A full-stack app in a single Docker container: **SvelteKit** frontend (static, CSR) + **PocketBase** backend (Go binary, SQLite, auth, real-time subscriptions, file storage).

- **[Posts](/posts/)** — CRUD demo with image uploads, slug generation, and user ownership.
- **[UI Reference](/ref-ui/)** — every oat-css component and pattern in one place.
- **[PocketBase Admin](/_/)** — manage collections, auth rules, files, and see live API docs.

## Key things to know

Before you start building, a few things worth knowing about the ground you're standing on.

### Auth just works

Login, signup, session persistence — all wired up. The `LoginBadge` in the nav handles the full flow. Try it now: create an account, log in, log out. The `posts/` page restricts editing to the record owner. That's the authorization pattern — define API rules per collection in the admin UI, and the frontend follows suit.

### Real-time is one line

PocketBase pushes live data to the browser via SSE. The `watch()` helper in page loaders sets up a subscription automatically — edit a post in one tab, see it update in another. No WebSockets to configure, no polling to manage.

### No server in your frontend

SvelteKit runs with `ssr = false` and `adapter-static`. There's no Node/Bun process serving pages. PocketBase serves the built static files directly. Every API call happens in the browser. This means: no server-side secrets, no server-side rendering gotchas, and the whole thing fits on a $4 VPS.

### Types stay in sync

After changing collections in the admin UI, run `bun run typegen` and `sk/src/lib/pocketbase/generated-types.ts` updates to match your schema. Your `collection("posts").getList()` calls get proper TypeScript inference — field names, types, expand relations.

## How to extend

### Add a new collection

1. Create it in the PocketBase admin UI (`/_/`).
1. Set API rules (who can read/write).
1. Run `bun run typegen` to get TypeScript types.
1. Use `client.collection("name").getList()` in your pages.

### Add a custom API route

Drop a `*.pb.js` file in `pb/pb_hooks/`:

```js
routerAdd("GET", "/api/my-endpoint", (c) => {
  return c.json(200, { hello: "world" });
});
```

See the existing [main.pb.js](https://github.com/spinspire/pocketbase-sveltekit-starter/blob/master/pb/pb_hooks/main.pb.js) for more examples — auth, email, record creation, external API calls.

### Add a new page

Create a `+page.svelte` (or `+page.md` with mdsvex) in `sk/src/routes/`. SvelteKit handles routing automatically. Use `client.collection("posts").getList()` to fetch data.

### Change the UI theme

Override CSS variables in `sk/src/app.scss`. The project uses [oat-css](https://oat.ink/) — semantic HTML styled by tag, not classes. Check the [UI Reference](/ref-ui/) for patterns.

### Write pages in Markdown

This page is written in Markdown (`+page.md`) using [mdsvex](https://mdsvex.pngwn.io/). You get the full power of Markdown with Svelte components, `{expressions}`, and `{#blocks}` inline. Frontmatter, code blocks, and components just work — see the [mdsvex docs](https://mdsvex.pngwn.io/docs) for syntax.

## Useful commands

```bash
cd sk && bun run dev       # frontend with HMR
cd sk && bun run typegen   # regenerate types after schema change
cd sk && bun run build     # build static frontend
cd sk && bun run check     # typecheck
cd pb && modd              # Go live reload (if extending PB with Go)
```

## Learn more

- [README](https://github.com/spinspire/pocketbase-sveltekit-starter/blob/master/README.md) — architecture, project structure, and full feature list.
- [AGENTS.md](https://github.com/spinspire/pocketbase-sveltekit-starter/blob/master/AGENTS.md) — AI-ready context: commands, gotchas, collection schemas.
- [PocketBase docs](https://pocketbase.io/docs/) — API reference, JS hooks, Go extensions.
- [SvelteKit docs](https://kit.svelte.dev/docs) — routing, loading, forms, adapters.
- [mdsvex docs](https://mdsvex.pngwn.io/docs) — Markdown in Svelte, components, layouts.

Now [browse some posts](/posts/) or [explore the UI reference](/ref-ui/).
