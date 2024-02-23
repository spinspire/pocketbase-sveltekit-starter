<script context="module">
import "../app.scss";
import { beforeNavigate } from "$app/navigation";
import { base } from "$app/paths";
import { metadata } from "$lib/app/stores";
import Alerts from "$lib/components/Alerts.svelte";
import Nav from "$lib/components/Nav.svelte";
import { site } from "$lib/config";
</script>

<script lang="ts">
import "../app.pcss";

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
  <div class="min-h-full">
    <Nav></Nav>
  </div>
</header>

<main>
  <div class="bg-base-100 justify-center pt-16">
    <div class="mx-auto max-w-7xl px-6 lg:px-8 ">
      <div class="mx-auto max-w-2xl text-center ">
        <h2 class="text-primary text-3xl font-bold tracking-tight sm:text-4xl">
          {#if headline}
            {headline}
          {/if}
        </h2>
        <!-- <p class="text-secondary mt-2 text-lg leading-8">
          {#if description}
            {description}
          {/if}
        </p> -->
        <Alerts></Alerts>
      </div>
      <slot />
    </div>
  </div>
</main>

<footer>
<!--   <div>
    <em>{site.name}</em> by
    <a href={site.source_url} target="_blank" rel="noreferrer">modible 2024</a>
  </div> -->
</footer>

<style>
</style>
