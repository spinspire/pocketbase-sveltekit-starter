<script lang="ts">
  import { base } from "$app/paths";

  const { data } = $props();
  $effect(() => {
    // you could set the metadata either here or in +page.ts
    data.metadata.title = "Home";
    data.metadata.headline = `Welcome to ${data.config.site?.name}`;
  });
</script>

<p>
  Visit
  <a
    href="https://github.com/spinspire/pocketbase-sveltekit-starter"
    target="_blank"
    rel="noopener noreferrer"
  >
    https://github.com/spinspire/pocketbase-sveltekit-starter
  </a>
  on <i class="bx bxl-github bx-sm"></i>GitHub to read the documentation.
</p>

<h2>Features</h2>
<ul>
  <li>Svelte 5: runes, $props, snippets, etc.</li>
  <li>
    SvelteKit: routing, PageData loading, CSR with <code>adapter-static</code>
  </li>
  <li>PocketBase: CRUD, typegen, realtime data updates</li>
  <li>PocketBase: JSVM hook, routes, etc.</li>
</ul>

<p>Now <a href="{base}/posts">browse/edit/create some posts</a>.</p>
