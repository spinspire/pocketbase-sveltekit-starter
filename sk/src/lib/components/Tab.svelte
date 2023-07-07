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
  .title {
    /* border: solid lightgray 2px; */
    border-bottom: none;
    display: inline-block;
    padding: 1em;
    margin-bottom: 0;
    border-radius: 6px 6px 0 0;
    color: var(--tab-color-fg, white);
    background-color: var(--tab-color-bg, black);
  }
  .title.active {
    color: var(--tab-color-active-fg, black);
    background-color: var(--tab-color-active-bg, white);
  }
  .title:not(.active):hover {
    cursor: pointer;
    color: var(--tab-color-hover-fg, black);
    background-color: var(--tab-color-hover-bg, lightgray);
  }
</style>
