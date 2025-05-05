<script lang="ts">
  import { base } from "$app/paths";
  import { page } from "$app/stores";
  import LoginBadge from "./LoginBadge.svelte";
  import { metadata } from "$lib/metadata";

  const links = [
    ["/", "Home"],
    ["/posts/", "Posts"],
    ["/hello/", "Hello"],
  ];
</script>

<header>
  <nav class="container">
    <a href={`${base}/`} class="logo">
      <img src={`${base}/favicon.svg`} alt="application logo" />
    </a>
    <h1 class="max center-align">{$metadata.headline ?? $metadata.title}</h1>
    <div class="tabs">
      {#each links as [path, label]}
        {@const active = $page.url.pathname == path}
        <a href={`${base}${path}`} class:active>{label}</a>
      {/each}
    </div>
    <LoginBadge />
  </nav>
</header>

<style lang="scss">
  header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    h1 {
      font-size: 2rem;
    }
    .logo {
      // responsive logo
      width: 2rem;
      height: 2rem;
      img {
        width: 100%;
        height: 100%;
      }
    }
  }
</style>
