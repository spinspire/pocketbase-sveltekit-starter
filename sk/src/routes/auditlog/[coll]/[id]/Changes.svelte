<script lang="ts">
  import type { AuditlogResponse } from "$lib/pocketbase/generated-types";

  export let auditlog: AuditlogResponse;
  $: keys = Object.keys(auditlog.original || {});
</script>

<table>
  <tbody>
    {#each keys as key}
      <tr>
        <th>{key}</th>
        <td><pre>{auditlog.original[key]}</pre></td>
        <td><pre>{auditlog.data[key]}</pre></td>
      </tr>
    {/each}
  </tbody>
</table>

<style>
  pre {
    margin: 0;
    padding: 0;
  }
</style>
