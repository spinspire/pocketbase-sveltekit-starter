<script lang="ts">
  import { goto } from "$app/navigation";
  import { authModel, save } from "$lib/pocketbase";
  import { alertOnFailure } from "$lib/pocketbase/ui";
  import type { PageData } from "./$types";
  export let data: PageData;
  $: ({ post } = data);
  async function submit(e: SubmitEvent) {
    post.user = $authModel?.id;
    alertOnFailure(async () => {
      await save("posts", post);
      goto("../..");
    });
  }
</script>

<form on:submit|preventDefault={submit}>
  <input name="title" bind:value={post.title} placeholder="title" />
  <input name="slug" bind:value={post.slug} placeholder="slug" />
  <textarea name="body" bind:value={post.body} placeholder="body" rows="10" />
  <input type="file" bind:files={post.files} multiple />
  <button type="submit">Submit</button>
</form>
