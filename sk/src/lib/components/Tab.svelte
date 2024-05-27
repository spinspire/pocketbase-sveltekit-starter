<script lang="ts">
  import { page } from "$app/stores";
  import { getContext, type Snippet } from "svelte";
  import type { Writable } from "svelte/store";

  const active = getContext<Writable<string>>("active");
  const {
    key,
    pathname,
    children = _children,
  }: { key: string; pathname?: string; children?: Snippet<[]> } = $props();
  $effect(() => {
    if ($page.url.pathname === pathname) {
      $active = key;
    }
  });
</script>

<!--
 @component
 Tab in a `TabGroup` component.
 - `key` must be unique.
 - `pathname` is optional and if provided is used to determine which tab is active
 You can provide `children` to render the content of the tab, or else by default
 button with `key` as the text will be rendered.
-->

{#snippet _children()}
  {key}
{/snippet}

<span
  class="tab"
  class:active={$active === key}
  onclick={() => ($active = key)}
  onkeypress={(e) => (e.key === "Enter" || e.key === " ") && ($active = key)}
  role="tab"
  aria-label={key}
  tabindex="0"
>
  {@render children()}
</span>

<style lang="scss">
  .tab {
    display: inline-block;
    padding: 1em;
    margin-bottom: 0;
    border-radius: 6px 6px 0 0;
    color: var(--tab-color-fg, --text-bright);
    background-color: var(--tab-color-bg, var(--background-alt));
    cursor: pointer;
    &.active {
      color: var(--tab-color-active-fg, var(--background-alt));
      background-color: var(--tab-color-active-bg, var(--text-bright));
    }
  }
</style>
