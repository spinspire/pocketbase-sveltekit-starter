<script lang="ts">
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
  <nav class="paginator" aria-label="Pagination">
    <button
      type="button"
      class="ghost"
      onclick={() => store.prev()}
      disabled={$store.page <= 1}
      aria-label="Previous page"
    >
      <i class="bi bi-chevron-left"></i>
    </button>
    <span class="page-info">page {$store.page} of {$store.totalPages}</span>
    <button
      type="button"
      class="ghost"
      onclick={() => store.next()}
      disabled={$store.page >= $store.totalPages}
      aria-label="Next page"
    >
      <i class="bi bi-chevron-right"></i>
    </button>
  </nav>
{/if}

<style>
  .paginator {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--space-3);
    padding-block: var(--space-3);
  }
  .page-info {
    font-size: 0.9em;
    color: light-dark(var(--color-2), var(--color-2));
  }
</style>
