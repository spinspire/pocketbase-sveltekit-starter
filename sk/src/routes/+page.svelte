<script lang="ts">
  import { metadata } from "$lib/app/stores";

  $metadata.title = "Mind";
</script>

<svelte:head>
  <title>{$metadata.title}</title>
</svelte:head>

<div class="container mx-auto my-12 px-4 sm:px-6 lg:px-8">
  <div class="grid grid-cols-1 gap-8">
    <article class="prose max-w-none bg-base-100 p-6 shadow-md">
      <h1>Welcome to Your Creative Space</h1>
      <h2>Where ideas flow and grow</h2>
      <p>
        Welcome to a minimalist platform designed for thinkers, creators, and
        dreamers. Here, your ideas can bloom into beautiful creations, guided by
        inspiration and powered by technology. Dive into your personal journal,
        explore new concepts, and let your creativity soar. Welcome to
        simplicity. Welcome to focus. Welcome to your new creative haven.
      </p>
    </article>
  </div>
</div>