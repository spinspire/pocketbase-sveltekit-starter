<script lang="ts">
export let active: string | number = 0;
import { writable } from "svelte/store";
import type { Writable } from "svelte/store";
import { setContext } from "svelte";
const store: Writable<string | number> = writable(active);
  
setContext("activeTab", store);

</script>

<div class="tabs">
  <slot name="tabs" />
</div>

<div class="tab-content">
  <slot />
</div>

<style>
.tabs {
  border-bottom: 2px solid var(--tab-color-active-bg, white);
}
.tab-content {
  padding: 1em 0;
}
</style>
