<script lang="ts">
  import type { AuditlogResponse } from "$lib/pocketbase/generated-types";

  const { auditlog }: { auditlog: AuditlogResponse } = $props();
  const keys = $derived(Object.keys(auditlog.original || {}));
</script>

<table>
  <thead>
    <tr>
      <th>Field</th>
      <th>Original</th>
      <th>Changed To</th>
    </tr>
  </thead>
  <tbody>
    {#each keys as key}
      <tr>
        <td>{key}</td>
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
