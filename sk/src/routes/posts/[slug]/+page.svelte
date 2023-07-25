<script lang="ts">
  import { base } from "$app/paths";
  import { page } from "$app/stores";
  import { metadata } from "$lib/app/stores";
  import Delete from "$lib/components/Delete.svelte";
  import { client } from "$lib/pocketbase";
  import type { PageData } from "./$types";
  export let data: PageData;
  $: ({
    post: { id, title, body, files },
  } = data);
  $: $metadata.title = title;
</script>

{#if $page.url.hash === "#delete"}
  <Delete table="posts" {id} />
{/if}

{#if files && files[0]}
  <img
    src={client.getFileUrl(data.post, files[0], { thumb: "600x0" })}
    alt={title}
  />
{/if}
<pre>{body}</pre>

<a href={`${base}/auditlog/posts/${id}`}>
  <button type="button">AuditLog</button>
</a>

<style>
  img {
    max-width: 100%;
  }
</style>
