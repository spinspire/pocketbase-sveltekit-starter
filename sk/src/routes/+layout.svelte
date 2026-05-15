<script lang="ts">
  import "../app.scss";
  import { page } from "$app/stores";
  import Alerts from "$lib/components/Alerts.svelte";
  import LoginBadge from "$lib/components/LoginBadge.svelte";
  import Nav from "$lib/components/Nav.svelte";
  import { metadata } from "$lib/metadata";
  import { resolve } from "$app/paths";
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

<header class="container">
  <a href={resolve("/")} class="logo">
    <img src={resolve("/favicon.ico")} alt="application logo" />
  </a>
  <Nav />
  <LoginBadge signupAllowed={config.signupAllowed} />
</header>
<main class="container">
  <Alerts />
  <h1>{$metadata.headline ?? $metadata.title}</h1>
  {@render children()}
</main>
<footer class="container">
  Copyright &copy; {config.site?.year}
  {config.site?.copyright}
</footer>

<style lang="scss">
  header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    .logo {
      width: 2rem;
      height: 2rem;
    }
  }
  main {
    flex-grow: 1;
  }
</style>
