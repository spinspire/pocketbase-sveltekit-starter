<script lang="ts" module>
  export { activityStore } from "$lib/activity";
</script>

<script lang="ts">
  let { active = false }: { active?: boolean } = $props();
</script>

<span class="spinner" aria-busy={active} aria-live="polite">
  {#if active}
    <span class="sr-only">Loading...</span>
  {/if}
</span>

<style>
  .spinner {
    display: inline-flex;
    width: 1em;
    height: 1em;
  }
  .spinner[aria-busy="true"]::after {
    content: "";
    width: 100%;
    height: 100%;
    border: 0.2em solid currentColor;
    border-right-color: transparent;
    border-radius: 50%;
    animation: spin 0.6s linear infinite;
  }
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
</style>
