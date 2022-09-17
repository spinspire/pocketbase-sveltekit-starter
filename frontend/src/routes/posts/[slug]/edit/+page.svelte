<script lang="ts">
  import { client } from "$lib/pocketbase";
  import type { PageData } from "./$types";
  export let data: PageData;
  $: ({ post } = data);
  async function submit(e: SubmitEvent) {
    const formData = new FormData(e.target as HTMLFormElement);
    if (!post.files.length) {
      formData.delete("files");
    }
    client.records.update("posts", post.id, formData);
  }
</script>

<form on:submit|preventDefault={submit}>
  <input name="title" bind:value={post.title} placeholder="title" />
  <input name="slug" bind:value={post.slug} placeholder="slug" />
  <textarea name="body" bind:value={post.body} placeholder="body" rows="10" />
  <input name="files" type="file" bind:files={post.files} multiple />
  <button type="submit">Submit</button>
</form>
