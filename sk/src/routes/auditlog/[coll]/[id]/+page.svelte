<script lang="ts">
  import type { PageData } from "./$types";
  import Changes from "./Changes.svelte";

  export let data: PageData;
</script>

<table>
  <thead>
    <th>when</th>
    <th>what</th>
    <th>who</th>
  </thead>
  <tbody>
    {#each data.logs as item}
      <tr>
        <td>{item.updated}</td>
        <td>{item.event}</td>
        <td>{item.admin || item.expand.user?.name || item.user}</td>
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
