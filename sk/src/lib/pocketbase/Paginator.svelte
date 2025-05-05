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
  <nav class="no-space">
    <button
      type="button"
      class="left-round fill"
      onclick={() => store.prev()}
      disabled={$store.page <= 1}>&laquo;</button
    >
    <button class="border no-round">
      <span>page {$store.page} of {$store.totalPages}</span>
    </button>
    <button
      type="button"
      class="right-round fill"
      onclick={() => store.next()}
      disabled={$store.page >= $store.totalPages}>&raquo;</button
    >
  </nav>
{/if}

<style lang="scss">
  button {
    font-weight: bold;

    &.fill {
      font-size: 1.5rem;
      align-content: center;
    }
  }
</style>
