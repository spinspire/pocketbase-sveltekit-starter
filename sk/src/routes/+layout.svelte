<script lang="ts">
  import "../app.scss";
  import { page } from "$app/stores";
  import Alerts from "$lib/components/Alerts.svelte";
  import Nav from "$lib/components/Nav.svelte";
  import { metadata } from "$lib/metadata";
  const { data, children } = $props();
  const config = $derived(data.config ?? {});

  $effect(() => {
    if ($page.error) {
      $metadata.title = $page.error.message;
    }
  });
</script>

<svelte:head>
  <title>{$metadata.title} | {config.site?.name}</title>
</svelte:head>

<Nav />
<main class="container">
  <Alerts />
  {@render children()}
</main>
<footer class="container">
  Copyright &copy; {config.site?.year}
  {config.site?.copyright}
</footer>

<style lang="scss">
  main {
    flex-grow: 1;
  }
</style>
