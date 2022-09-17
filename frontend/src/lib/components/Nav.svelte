<script lang="ts">
  import { base } from "$app/paths";
  import { page } from "$app/stores";
  import Login from "./Login.svelte";
  const links = [
    ["Home", "/"],
    ["Hello", "/hello"],
  ].map(([text, href]) => [
    text,
    base + href.replace(/\/?$/, "/"), // prefix=base, suffix=a trailing slash if not present
  ]);
</script>

<nav>
  <ul>
    {#each links as [text, href]}
      <li class:active={href === $page.url.pathname}><a {href}>{text}</a></li>
    {/each}
  </ul>
  <ul>
    <li><Login /></li>
  </ul>
</nav>

<style lang="scss">
  nav {
    margin: 0 auto;
    max-width: var(--width-content);
    padding: 0 1rem;
    background-color: #ddd;
    li.active a {
      text-decoration: underline;
    }
  }
</style>
