<script lang="ts">
  import Login from "./Login.svelte";
</script>

<nav>
  <ul>
    <li><a href="/">Home</a></li>
    <li><a href="/hello">Hello</a></li>
  </ul>
  <ul>
    <li><Login /></li>
  </ul>
</nav>

<style>
  nav {
    margin: 0 auto;
    max-width: var(--width-content);
    padding: 0 1rem;
    background-color: #ddd;
  }
</style>
