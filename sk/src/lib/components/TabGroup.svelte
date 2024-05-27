<script lang="ts">
  import { setContext, type Snippet } from "svelte";
  import { writable } from "svelte/store";

  let {
    active = $bindable(""),
    tabs,
    children,
  }: {
    active?: string;
    defaultTab?: string;
    tabs: Snippet<[]>;
    children: Snippet<[]>;
  } = $props();
  const activeStore = writable(active);
  // make `active` reflect $activeStore
  activeStore.subscribe((value) => (active = value));
  setContext("active", activeStore);
</script>

<!--
@component
Component to build a tabbed interface. It contains ...
- bindable prop `active`
- `tabs` snippet containing `Tab` components. Each `Tab` component:
  - must have `key`
  - `pathname` is optional and if provided is used to determine which tab is active
- child content that renders the content of the active tab

Example:
```svelte
<Tabs bind:active>
  {#snippet tabs()}
    <a href="{base}/posts/{record.slug}/">
      <Tab key="view" pathname="/posts/{record.slug}/">View</Tab>
    </a>
    <a href="{base}/posts/{record.slug}/edit/">
      <Tab key="edit" pathname="/posts/{record.slug}/edit/">Edit</Tab>
    </a>
    <a href="{base}/posts/{record.slug}/delete/">
      <Tab key="delete" pathname="/posts/{record.slug}/delete/">Delete</Tab>
    </a>
  {/snippet}
  <p>Active tab: {active}</p>
</Tabs>
```
-->

<div class="tabs">
  {@render tabs()}
</div>

{@render children()}

<style lang="scss">
  .tabs {
    border-bottom: solid var(--tab-color-active-bg, var(--text-bright)) 1px;
    margin-bottom: 1rem;
  }
</style>
