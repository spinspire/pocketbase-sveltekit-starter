<script context="module">
  import { beforeNavigate } from "$app/navigation";
  import { metadata } from "$lib/app/stores";
  import Alerts from "$lib/components/Alerts.svelte";
  import Nav from "$lib/components/Nav.svelte";
  import { site } from "$lib/config";
</script>

<script lang="ts">
  $: title = $metadata.title ? $metadata.title + " | " + site.name : site.name;
  $: description = $metadata.description ?? site.description;
  $: headline = $metadata.headline ?? $metadata.title;
  // reset metadata on navigation so that the new page inherits nothing from the old page
  beforeNavigate(() => {
    $metadata = {};
  });
</script>

<svelte:head>
  <title>{title}</title>
  <meta name="description" content={description} />
</svelte:head>

<Nav />
<Alerts />
<main>
  {#if headline}
    <h1>{headline}</h1>
  {/if}
  <slot />
</main>

<style>
  @import url("https://unpkg.com/mvp.css");
</style>
