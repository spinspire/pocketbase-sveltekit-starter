<script lang="ts">
  import { goto } from "$app/navigation";
  import { client } from "$lib/pocketbase";
  import type { PageData } from "./$types";
  export let data: PageData;
  let files: FileList;
  $: ({ post } = data);
  async function submit(e: SubmitEvent) {
    const formData = new FormData(e.target as HTMLFormElement);
    for (const file of files ?? []) {
      formData.append("files", file);
    }
    if (post.id) {
      await client.records.update("posts", post.id, formData);
    } else {
      formData.set("uid", client.authStore.model?.id ?? "");
      await client.records.create("posts", formData);
    }
    goto("../..");
  }
</script>

<form on:submit|preventDefault={submit}>
  <input name="title" bind:value={post.title} placeholder="title" />
  <input name="slug" bind:value={post.slug} placeholder="slug" />
  <textarea name="body" bind:value={post.body} placeholder="body" rows="10" />
  <input type="file" bind:files multiple />
  <button type="submit">Submit</button>
</form>
