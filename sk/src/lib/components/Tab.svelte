<script lang="ts">
export let key: string | number;
import { getContext } from "svelte";
import type { Writable } from "svelte/store";
const store: Writable<string | number> = getContext("activeTab");
</script>

<button
  type="button"
  class="title"
  on:click={() => ($store = key)}
  class:active={$store === key}
>
  <slot />
</button>

<style>
</style>
