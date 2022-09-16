<script context="module">
  import Alerts from "$lib/components/Alerts.svelte";
  import Nav from "$lib/components/Nav.svelte";

  // static frontend, prerendered with @sveltejs/adapter-static
  export const prerender = true;
</script>

<Nav />
<Alerts />
<main>
  <slot />
</main>

<style>
  @import url("https://unpkg.com/mvp.css");
</style>
