<script context="module">
  import Nav from "$lib/components/Nav.svelte";

  // static frontend, prerendered with @sveltejs/adapter-static
  export const prerender = true;
</script>

<Nav />
<main>
  <slot />
</main>

<style>
  @import url("https://unpkg.com/mvp.css");
</style>
