<script context="module">
  import "../app.scss";
  import { beforeNavigate } from "$app/navigation";
  import { base } from "$app/paths";
  import { metadata } from "$lib/app/stores";
  import Alerts from "$lib/components/Alerts.svelte";
  import Nav from "$lib/components/Nav.svelte";
  import { site, sponsor } from "$lib/config";
</script>

<script lang="ts">
  import LoginBadge from "$lib/components/LoginBadge.svelte";

  $: title = $metadata.title ? $metadata.title + " | " + site.name : site.name;
  $: description = $metadata.description ?? site.description;
  $: headline = $metadata.headline ?? $metadata.title;
  // reset metadata on navigation so that the new page inherits nothing from the old page
  beforeNavigate(() => {
    $metadata = {};
  });
</script>

<svelte:head>
  <title>{title}</title>
  <meta name="description" content={description} />
</svelte:head>

<header>
  <a href={`${base}/`} class="logo"
    ><img src={`${base}/favicon.ico`} alt="application logo" /></a
  >
  <Nav />
  <LoginBadge />
</header>
<main>
  {#if headline}
    <h1>{headline}</h1>
  {/if}
  <Alerts />
  <slot />
</main>
<footer>
  <div>
    <em>{site.name}</em> is an
    <a href={site.source_url} target="_blank" rel="noreferrer"
      >Open Source project</a
    >
    sponsored by
    <a href={sponsor.url} target="_blank" rel="noreferrer">{sponsor.name}</a>.
  </div>
</footer>

<style lang="scss">
  header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    .logo {
      width: 2rem;
      height: 2rem;
    }
  }
</style>
