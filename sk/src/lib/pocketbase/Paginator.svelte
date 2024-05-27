<script lang="ts">
  import type { Snippet } from "svelte";
  import type { PageStore } from ".";

  const {
    store,
    showIfSinglePage = false,
  }: {
    store: PageStore;
    showIfSinglePage?: boolean;
  } = $props();
</script>

{#if showIfSinglePage || $store.totalPages > 1}
  <div class="paginator">
    <button
      type="button"
      onclick={() => store.prev()}
      disabled={$store.page <= 1}>&laquo;</button
    >
    <div>page {$store.page} of {$store.totalPages}</div>
    <button
      type="button"
      onclick={() => store.next()}
      disabled={$store.page >= $store.totalPages}>&raquo;</button
    >
  </div>
{/if}

<style lang="scss">
  .paginator {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin: auto;
  }
</style>
