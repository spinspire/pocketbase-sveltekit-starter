<script lang="ts">
  import { metadata } from "$lib/metadata.js";
  import ImgModal from "$lib/pocketbase/ImgModal.svelte";

  const { data } = $props();
  const record = $derived(data.record);
  $effect(() => {
    $metadata.title = $metadata.headline = record.title;
  });
</script>

<article>
  <pre class="body">{record.body}</pre>
  {#each record.files ?? [] as file, index}
    <ImgModal {record} filename={file} />
  {/each}
</article>
