<script lang="ts">
  import { getContext, type Snippet } from "svelte";
  import type { Writable } from "svelte/store";

  let { key, children }: { key: string; children: Snippet<[]> } = $props();

  const store: Writable<string | number> = getContext("active");
</script>

{#if $store === key}
  {@render children()}
{/if}
