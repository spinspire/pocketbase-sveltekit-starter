<script lang="ts">
  import { alerts } from "$lib/alerts";

  function onunhandledrejection(e: PromiseRejectionEvent) {
    alerts.error(e.reason.toString());
    const { data = {} } = e.reason.response ?? {};
    for (const [key, value] of Object.entries(data)) {
      alerts.error(`${key}: ${(value as any)?.message}`);
    }
  }
</script>

<svelte:window {onunhandledrejection} />

{#if $alerts.length > 0}
  <div class="alerts">
    {#if $alerts.length > 1}
      <button onclick={() => alerts.dismissAll()} class="ghost small">dismiss all</button>
    {/if}
    {#each $alerts as alert}
      <div role="alert" data-variant={alert.type === "error" ? "danger" : alert.type}>
        {#if alert.html}
          {@html alert.message}
        {:else}
          {alert.message}
        {/if}
        <button onclick={() => alerts.dismiss(alert)} class="ghost icon small" aria-label="dismiss">
          <i class="bi bi-x-lg"></i>
        </button>
      </div>
    {/each}
  </div>
{/if}

<style>
  .alerts {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
    margin-block-end: var(--space-4);
  }
  div[role="alert"] {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-2);
    padding: var(--space-3) var(--space-4);
    border-radius: var(--radius-medium);
  }
</style>
