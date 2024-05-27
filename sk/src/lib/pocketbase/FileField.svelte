<script lang="ts">
  import { client } from ".";

  let {
    record,
    fieldName,
    toBeRemoved = $bindable([]),
  }: { record: any; fieldName: string; toBeRemoved?: string[] } = $props();
</script>

<table>
  <thead>
    <tr>
      <th>file</th>
      <th></th>
    </tr>
  </thead>
  <tbody>
    {#each record[fieldName] as file, index}
      {@const deleted = toBeRemoved.includes(file)}
      {@const icon = deleted ? "trash-alt" : "trash"}
      {@const title = deleted ? "click to restore" : "click to remove"}
      {@const onclick = deleted
        ? () => (toBeRemoved = toBeRemoved.filter((f) => f !== file))
        : () => (toBeRemoved = [...toBeRemoved, file])}
      <tr>
        <td class:deleted>
          <a href={client.files.getUrl(record, file)} target="_blank">
            {file}
          </a>
        </td>
        <td>
          <button type="button" class="small round" {onclick} {title}>
            <i class="bx bx-{icon}"></i>
          </button>
        </td>
      </tr>
    {:else}
      <tr>
        <td colspan="3">No files attached to this record.</td>
      </tr>
    {/each}
  </tbody>
</table>

<style>
  .deleted {
    text-decoration: line-through;
  }
</style>
