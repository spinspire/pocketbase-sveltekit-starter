<script lang="ts">
  import { resolve } from "$app/paths";
  import { metadata } from "$lib/metadata.js";

  const { data } = $props();
  $effect(() => {
    $metadata.title = "Home";
    $metadata.headline = `Welcome to ${data.config.site?.name}`;
  });
</script>

<p>
  You've got the project running locally. Here's what you need to know to start
  building.
</p>

<h2>What's here</h2>

<p>
  A full-stack app in a single Docker container: <strong>SvelteKit</strong> frontend
  (static, CSR) + <strong>PocketBase</strong> backend (Go binary, SQLite, auth, real-time
  subscriptions, file storage).
</p>

<ul>
  <li>
    <strong><a href={resolve("/posts/")}>Posts</a></strong> — CRUD demo with
    image uploads, slug generation, and user ownership.
  </li>
  <li>
    <strong><a href={resolve("/ref-ui/")}>UI Reference</a></strong> — every
    oat-css component and pattern in one place.
  </li>
  <li>
    <strong><a href="/_/" target="_blank" rel="noopener noreferrer">PocketBase Admin</a></strong>
    — manage collections, auth rules, files, and see live API docs.
  </li>
</ul>

<h2>Key things to know</h2>

<p>
  Before you start building, a few things worth knowing about the ground you're
  standing on.
</p>

<h3>Auth just works</h3>
<p>
  Login, signup, session persistence — all wired up. The
  <code>LoginBadge</code> in the nav handles the full flow. Try it now: create an
  account, log in, log out. The <code>posts/</code> page restricts editing to the
  record owner. That's the authorization pattern — define API rules per
  collection in the admin UI, and the frontend follows suit.
</p>

<h3>Real-time is one line</h3>
<p>
  PocketBase pushes live data to the browser via SSE. The
  <code>watch()</code> helper in page loaders sets up a subscription
  automatically — edit a post in one tab, see it update in another. No
  WebSockets to configure, no polling to manage.
</p>

<h3>No server in your frontend</h3>
<p>
  SvelteKit runs with <code>ssr = false</code> and
  <code>adapter-static</code>. There's no Node/Bun process serving pages.
  PocketBase serves the built static files directly. Every API call happens in
  the browser. This means: no server-side secrets, no server-side rendering
  gotchas, and the whole thing fits on a $4 VPS.
</p>

<h3>Types stay in sync</h3>
<p>
  After changing collections in the admin UI, run
  <code>bun run typegen</code> and <code>sk/src/lib/pocketbase/generated-types.ts</code>
  updates to match your schema. Your <code>collection("posts").getList()</code>
  calls get proper TypeScript inference — field names, types, expand relations.
</p>

<h2>How to extend</h2>

<h3>Add a new collection</h3>
<ol>
  <li>Create it in the PocketBase admin UI (<code>/_/</code>).</li>
  <li>Set API rules (who can read/write).</li>
  <li>Run <code>bun run typegen</code> to get TypeScript types.</li>
  <li>Use <code>client.collection("name").getList()</code> in your pages.</li>
</ol>

<h3>Add a custom API route</h3>
<p>
  Drop a <code>*.pb.js</code> file in <code>pb/pb_hooks/</code>:
</p>
<pre><code>routerAdd("GET", "/api/my-endpoint", (c) =&gt; &#123;
  return c.json(200, &#123; hello: "world" &#125;);
&#125;);</code></pre>
<p>
  See the existing
  <a href="https://github.com/spinspire/pocketbase-sveltekit-starter/blob/master/pb/pb_hooks/main.pb.js" target="_blank" rel="noopener noreferrer">main.pb.js</a>
  for more examples — auth, email, record creation, external API calls.
</p>

<h3>Add a new page</h3>
<p>
  Create a <code>+page.svelte</code> in <code>sk/src/routes/</code>. SvelteKit
  handles routing automatically. Use
  <code>client.collection("posts").getList()</code> to fetch data.
</p>

<h3>Change the UI theme</h3>
<p>
  Override CSS variables in <code>sk/src/app.scss</code>. The project uses
  <a href="https://oat.ink/" target="_blank" rel="noopener noreferrer">oat-css</a>
  — semantic HTML styled by tag, not classes. Check the
  <a href={resolve("/ref-ui/")}>UI Reference</a> for patterns.
</p>

<h2>Useful commands</h2>

<pre><code>cd sk && bun run dev       # frontend with HMR
cd sk && bun run typegen   # regenerate types after schema change
cd sk && bun run build     # build static frontend
cd sk && bun run check     # typecheck
cd pb && modd              # Go live reload (if extending PB with Go)</code></pre>

<h2>Learn more</h2>

<ul>
  <li>
    <a href="https://github.com/spinspire/pocketbase-sveltekit-starter/blob/master/README.md" target="_blank" rel="noopener noreferrer">README</a>
    — architecture, project structure, and full feature list.
  </li>
  <li>
    <a href="https://github.com/spinspire/pocketbase-sveltekit-starter/blob/master/AGENTS.md" target="_blank" rel="noopener noreferrer">AGENTS.md</a>
    — AI-ready context: commands, gotchas, collection schemas.
  </li>
  <li>
    <a href="https://pocketbase.io/docs/" target="_blank" rel="noopener noreferrer">PocketBase docs</a>
    — API reference, JS hooks, Go extensions.
  </li>
  <li>
    <a href="https://kit.svelte.dev/docs" target="_blank" rel="noopener noreferrer">SvelteKit docs</a>
    — routing, loading, forms, adapters.
  </li>
</ul>

<p>Now <a href={resolve("/posts/")}>browse some posts</a> or <a href={resolve("/ref-ui/")}>explore the UI reference</a>.</p>
