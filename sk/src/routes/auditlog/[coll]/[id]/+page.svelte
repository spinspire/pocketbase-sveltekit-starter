<script lang="ts">
    import { metadata } from "$lib/metadata";
  import type { PageData } from "./$types";
  import Changes from "./Changes.svelte";

  const { data }: { data: PageData } = $props();
  $effect(() => {
    $metadata.title = $metadata.headline = "Auditlog";
  });
</script>

<h1>Audit Log</h1>

<table>
  <thead>
    <tr>
      <th>When</th>
      <th>Event</th>
      <th>Who</th>
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
