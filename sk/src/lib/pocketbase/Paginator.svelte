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
  <nav class="hstack justify-center gap-3" aria-label="Pagination" style:padding-block="var(--space-3)">
    <button
      type="button"
      class="ghost"
      onclick={() => store.prev()}
      disabled={$store.page <= 1}
      aria-label="Previous page"
    >
      <i class="bi bi-chevron-left"></i>
    </button>
    <span class="small" style:color="var(--muted-foreground)">
      page {$store.page} of {$store.totalPages}
    </span>
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
