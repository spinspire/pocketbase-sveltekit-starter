<script lang="ts">
  import type { PageStore } from ".";

  export let store: PageStore;
  export let showIfSinglePage = false;
</script>

{#if showIfSinglePage || $store.totalPages > 1}
  <div class="paginator">
    <button
      type="button"
      on:click={() => store.prev()}
      disabled={$store.page <= 1}>&laquo;</button
    >
    <div>page {$store.page} of {$store.totalPages}</div>
    <button
      type="button"
      on:click={() => store.next()}
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
