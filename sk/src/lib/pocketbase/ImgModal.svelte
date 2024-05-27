<script lang="ts">
  import type { BaseModel } from "pocketbase";
  import { client } from ".";
  import Dialog from "$lib/components/Dialog.svelte";

  const {
    record,
    filename,
    thumbOnly,
  }: {
    record: BaseModel;
    filename: string;
    thumbOnly?: boolean;
  } = $props();
</script>

{#if record && filename}
  {@const src = client.getFileUrl(record, filename, { thumb: "100x100" })}
  <Dialog>
    {#snippet trigger(show)}
      <button onclick={show} type="button" class="thumbnail">
        <img {src} alt="todo" />
      </button>
    {/snippet}
    {#if !thumbOnly}
      {@const src = client.getFileUrl(record, filename)}
      <img {src} alt="todo" />
    {/if}
  </Dialog>
{/if}

<style lang="scss">
  .thumbnail {
    padding: 0;
    > img {
      border-radius: 5px;
      box-shadow: 0 0 5px 0px black;
    }
  }
</style>
