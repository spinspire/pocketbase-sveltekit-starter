<script lang="ts">
  import type { PageData } from "./$types";
  import Changes from "./Changes.svelte";

  const { data }: { data: PageData } = $props();
  $effect(() => {
    data.metadata.title = data.metadata.headline = "Auditlog";
  });
</script>

<table>
  <thead>
    <tr>
      <th>when</th>
      <th>what</th>
      <th>who</th>
    </tr>
  </thead>
  <tbody>
    {#each data.logs as item}
      <tr>
        <td>{item.updated}</td>
        <td>{item.event}</td>
        <td>{item.admin || item.expand?.user?.name || item.user}</td>
      </tr>
      <tr>
        <td colspan="3"><Changes auditlog={item} /></td>
      </tr>
    {:else}
      <tr>
        <td colspan="3">No records found.</td>
      </tr>
    {/each}
  </tbody>
</table>
