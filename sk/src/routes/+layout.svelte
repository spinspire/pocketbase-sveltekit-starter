<script lang="ts">
  import "../app.scss";
  import { page } from "$app/stores";
  import LoginBadge from "$lib/components/LoginBadge.svelte";
  import Nav from "$lib/components/Nav.svelte";
  import { metadata } from "$lib/metadata";
  import { resolve } from "$app/paths";
  import { onNavigate } from "$app/navigation";

  const { data, children } = $props();
  const config = $derived(data.config ?? {});

  $effect(() => {
    if ($page.error) {
      $metadata.title = $page.error.message;
    }
  });

  // View Transitions (modern HTML)
  onNavigate((navigation) => {
    // @ts-ignore -- View Transitions API
    if (!document.startViewTransition) return;
    return new Promise((resolve) => {
      // @ts-ignore
      document.startViewTransition(() => {
        resolve();
      });
    });
  });
</script>

<svelte:head>
  <title>{$metadata.title} | {config.site?.name}</title>
</svelte:head>

<nav data-topnav>
  <a href={resolve("/")} class="logo">
    <img src={resolve("/favicon.ico")} alt="" width="24" height="24" />
  </a>
  <Nav />
  <LoginBadge signupAllowed={config.signupAllowed} />
</nav>

<main class="container">
  <h1>{$metadata.headline ?? $metadata.title}</h1>
  {@render children()}
</main>

<footer class="container">
  <p class="text-light">
    Copyright &copy; {config.site?.year}
    {config.site?.copyright}
  </p>
</footer>

<style>
  main {
    flex-grow: 1;
    padding-block: var(--space-6);
  }
  footer {
    padding-block: var(--space-4);
    border-block-start: 1px solid var(--border);
  }
</style>
