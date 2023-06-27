<script type="ts">
  export let active: string | number = 0;
  import { writable } from "svelte/store";
  import type { Writable } from "svelte/store";
  import { setContext } from "svelte";
  const store: Writable<string | number> = writable(active);
  setContext("activeTab", store);
</script>

<style>
  .tabs {
    border-bottom: solid var(--tab-color-active-bg, black) 2px;
  }
  .tab-content {
    padding: 1em;
  }
</style>

<div class="tabs">
  <slot name="tabs" />
</div>

<div class="tab-content">
  <slot />
</div>