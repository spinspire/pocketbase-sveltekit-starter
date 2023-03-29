<script lang="ts">
  import { base } from "$app/paths";
  import { page } from "$app/stores";
  import Login from "./Login.svelte";
  const links = [
    ["Home", "/"],
    ["Posts", "/posts"],
    ["Hello", "/hello"],
  ].map(([text, href]) => [
    text,
    base + href.replace(/\/?$/, "/"), // prefix=base, suffix=a trailing slash if not present
  ]);
</script>

<nav>
  {#each links as [text, href]}
    <a class:active={href === $page.url.pathname} {href}>{text}</a>
  {/each}
</nav>

<style lang="scss">
  nav {
    a {
      padding: 0.5em 1em;
      margin: 0;
      background: var(--background-alt);
      &.active {
        background: var(--background);
        font-weight: bold;
        border-bottom: solid;
      }
    }
  }
</style>
