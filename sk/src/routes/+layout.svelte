<script lang="ts" context="module">
import { beforeNavigate } from "$app/navigation";
import { metadata } from "$lib/app/stores";
import { site } from "$lib/config";
import PocketBase from "pocketbase";

// Initialize PocketBase client
const pb = new PocketBase(`$(import.meta.env.VITE_APP_BASE_URL)`);
</script>

<script lang="ts">
import "../app.scss";
import Alerts from "$lib/components/Alerts.svelte";
import Nav from "$lib/components/Nav.svelte";
    import ThemeSwitch from "$lib/components/ThemeSwitch.svelte";

$: title = $metadata.title ? $metadata.title + " | " + site.name : site.name;
$: description = $metadata.description ?? site.description;
$: headline = $metadata.headline ?? $metadata.title;

// Reset metadata on navigation so that the new page inherits nothing from the old page
beforeNavigate(() => {
  $metadata = {};
});
</script>

<svelte:head>
  <title>{title}</title>
  <meta name="description" content={description} />
</svelte:head>

<div class="flex min-h-screen h-screen flex-col">
  <header>
    <Nav />
  </header>

  <main class="flex-grow">
    <div class="pt-4">
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div class="mx-auto max-w-2xl text-center">
          {#if headline}
            <h1
              class="text-primary text-3xl font-bold tracking-tight sm:text-4xl"
            >
              {headline}
            </h1>
          {/if}
          <Alerts />
        </div>
        <slot />
      </div>
    </div>
  </main>

  <footer class="py-4">
    <div class="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
      <p class="text-base-content text-sm">        
        <ThemeSwitch></ThemeSwitch>
        &copy; {new Date().getFullYear()}
        {site.name}. All rights reserved.
      </p>
    </div>
  </footer>
</div>
