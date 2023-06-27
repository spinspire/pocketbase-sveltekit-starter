<script lang="ts">
  export let key: string | number;
  import { getContext } from "svelte";
  import type { Writable } from "svelte/store";
  const store: Writable<string | number> = getContext("activeTab");
</script>

{#if $store === key}
  <slot />
{/if}