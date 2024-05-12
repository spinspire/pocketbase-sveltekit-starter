<script lang="ts">
  import { base } from "$app/paths";
  import { page } from "$app/stores";
  const links = [
    ["/", "Home"],
    ["/posts/", "Posts"],
    ["/hello/", "Hello"],
  ];
</script>

<nav>
  {#each links as [path, label]}
    {@const active = $page.url.pathname == path}
    <a href={`${base}${path}`} class:active>{label}</a>
  {/each}
</nav>

<style lang="scss">
  nav {
    a {
      padding: 0.5em 1em;
      margin: 0;
      border-radius: 0;
      background: var(--background-alt);
      border-bottom: solid var(--background);
      &.active {
        background: var(--background);
        font-weight: bold;
        border-bottom: solid var(--links);
      }
      &:first-child {
        border-top-left-radius: 0.5rem;
        border-bottom-left-radius: 0.5rem;
      }
      &:last-child {
        border-top-right-radius: 0.5rem;
        border-bottom-right-radius: 0.5rem;
      }
    }
  }
</style>
