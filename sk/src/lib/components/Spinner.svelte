<script lang="ts" module>
  export { activityStore } from "$lib/activity";
</script>

<script lang="ts">
  let { active = false }: { active?: boolean } = $props();
</script>

{#if active}
  <span class="sr-only">Loading...</span>
{/if}
