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
  let menuOpen = $state(false);

  $effect(() => {
    if ($page.error) {
      $metadata.title = $page.error.message;
    }
  });

  $effect(() => {
    $page.url.pathname;
    menuOpen = false;
  });

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
  <div class="container hstack" style:gap="var(--space-3)" style:justify-content="space-between">
    <a href={resolve("/")} class="logo">
      <img src={resolve("/favicon.ico")} alt="" width="24" height="24" />
    </a>
    <Nav />
    <LoginBadge signupAllowed={config.signupAllowed} />
  </div>
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

<button
  class="mobile-menu-toggle"
  aria-label={menuOpen ? "Close menu" : "Open menu"}
  aria-expanded={menuOpen}
  onclick={() => (menuOpen = !menuOpen)}
>
  <svg width="24" height="24" fill="currentColor" viewBox="0 0 16 16">
    {#if menuOpen}
      <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
    {:else}
      <path d="M2.5 12a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5z"/>
    {/if}
  </svg>
</button>

{#if menuOpen}
  <div class="mobile-overlay" onclick={() => (menuOpen = false)} role="presentation"></div>
  <div class="mobile-menu">
    <Nav />
    <div style:padding="var(--space-3)">
      <LoginBadge signupAllowed={config.signupAllowed} />
    </div>
  </div>
{/if}

<style>
  main {
    flex-grow: 1;
    padding-block: var(--space-6);
  }
  footer {
    padding-block: var(--space-4);
    border-block-start: 1px solid var(--border);
  }
  .logo {
    display: flex;
    align-items: center;
  }

  /* Bottom hamburger toggle — mobile only */
  .mobile-menu-toggle {
    display: none;
    position: fixed;
    bottom: var(--space-4);
    right: var(--space-4);
    z-index: 10;
    width: 48px;
    height: 48px;
    border-radius: 50%;
    border: 1px solid var(--border);
    background: var(--background);
    box-shadow: var(--shadow-medium);
    cursor: pointer;
    align-items: center;
    justify-content: center;
    padding: 0;
    padding-bottom: env(safe-area-inset-bottom, 0);
    transition: transform var(--transition-fast), box-shadow var(--transition-fast);
  }
  .mobile-menu-toggle:hover {
    box-shadow: var(--shadow-large);
  }

  .mobile-overlay {
    display: none;
    position: fixed;
    inset: 0;
    z-index: 8;
    background: rgb(0 0 0 / 0.4);
  }

  .mobile-menu {
    display: none;
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 9;
    background: var(--background);
    border-block-start: 1px solid var(--border);
    box-shadow: var(--shadow-large);
    padding-block: var(--space-3);
    padding-bottom: calc(var(--space-4) + env(safe-area-inset-bottom, 0px));
    animation: slide-up 0.2s ease-out;
  }

  @keyframes slide-up {
    from { transform: translateY(100%); }
    to { transform: translateY(0); }
  }

  @media (max-width: 768px) {
    .mobile-menu-toggle {
      display: flex;
    }
    .mobile-overlay {
      display: block;
    }
    .mobile-menu {
      display: flex;
      flex-direction: column;
      gap: var(--space-2);
    }
    :global(nav[data-topnav] .nav-links) {
      display: none;
    }
  }
</style>
