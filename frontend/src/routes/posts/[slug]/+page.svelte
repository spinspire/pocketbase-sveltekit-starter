<script lang="ts">
  import { metadata } from "$lib/app/stores";
  import { client } from "$lib/pocketbase";
  import type { PageData } from "./$types";
  export let data: PageData;
  $: ({
    post: { title, body, files },
  } = data);
  $: $metadata.title = title;
</script>

{#if files && files[0]}
  <img
    src={client.records.getFileUrl(data.post, files[0], { thumb: "600x0" })}
    alt={title}
  />
{/if}
<pre>{body}</pre>

<style>
  img {
    max-width: 100%;
  }
</style>
