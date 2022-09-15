<script context="module">
  // static frontend, prerendered with @sveltejs/adapter-static
  export const prerender = true;
</script>

<nav>
  <ul>
    <li><a href="/">Home</a></li>
    <li><a href="/hello">Hello</a></li>
  </ul>
</nav>
<main>
  <slot />
</main>

<style>
  @import url("https://unpkg.com/mvp.css");
  nav {
    margin: 0 auto;
    max-width: var(--width-content);
    padding: 0 1rem;
    background-color: #ddd;
  }
</style>
