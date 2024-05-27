<script lang="ts">
  import "../app.scss";
  import { base } from "$app/paths";
  import { page } from "$app/stores";
  import Alerts from "$lib/components/Alerts.svelte";
  import LoginBadge from "$lib/components/LoginBadge.svelte";
  import Nav from "$lib/components/Nav.svelte";
  const { data, children } = $props();
  const metadata = $derived(data.metadata ?? {});
  const config = $derived(data.config ?? {});

  $effect(() => {
    if ($page.error) {
      metadata.title = $page.error.message;
    }
  });
</script>

<svelte:head>
  <title>{metadata.title} | {config.site?.name}</title>
</svelte:head>

<header class="container">
  <a href={`${base}/`} class="logo">
    <img src={`${base}/favicon.svg`} alt="application logo" />
  </a>
  <Nav />
  <LoginBadge signupAllowed={config.signupAllowed} />
</header>
<main class="container">
  <Alerts />
  <h1>{metadata.headline ?? metadata.title}</h1>
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
