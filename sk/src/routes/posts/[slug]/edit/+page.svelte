<script lang="ts">
  import { alerts } from "$lib/alerts";
  import FileInput from "$lib/components/FileInput.svelte";
  import Spinner from "$lib/components/Spinner.svelte";
  import { activityStore } from "$lib/activity";
  import { metadata } from "$lib/metadata.js";
  import { authModel, client, save } from "$lib/pocketbase";
  import FileField from "$lib/pocketbase/FileField.svelte";
  import type { PostsResponse } from "$lib/pocketbase/generated-types.js";
  import z from "zod";

  const { data } = $props();
  let record = $derived(data.record);
  let fileInput = $state() as HTMLInputElement;
  let toBeRemoved = $state([]);
  $effect(() => {
    $metadata.title = $metadata.headline = `Edit Post: ${record.title}`;
  });

  const schema = z.object({
    id: z.string().optional().describe("ID"),
    title: z.string().trim().min(1, "value required.").describe("Title"),
    slug: z
      .string()
      .trim()
      .min(1, "required.")
      .refine((s: string) => !s.startsWith("/"), "must not start with a slash.")
      .describe("Slug"),
    body: z.string().trim().min(1, "required.").describe("Body"),
  });

  async function onsubmit(e: SubmitEvent) {
    e.preventDefault();
    const { success, error, data } = schema.safeParse(record);
    if (success) {
      const files = fileInput?.files;
      const user = client.authStore.isSuperuser ? "" : $authModel?.id;
      record = await save<PostsResponse>("posts", {
        ...data,
        files,
        user,
        "files-": toBeRemoved,
      });
      alerts.info("Post saved.", 5000);
      history.back();
    } else {
      Object.entries(error.flatten().fieldErrors).forEach(([k, v]) =>
        alerts.error(`${k}: ${v}`)
      );
    }
  }
  const store = activityStore<SubmitEvent>((e) => onsubmit(e));
</script>

<form onsubmit={store.run} class="vstack gap-4">
  <output class="small muted">ID: {record.id ?? "-"}</output>

  <div class="hstack gap-4">
    <label data-field class="half">
      Title
      <input type="text" placeholder="Enter post title" bind:value={record.title} />
    </label>
    <label data-field class="half">
      Slug
      <input type="text" placeholder="url-friendly-slug" bind:value={record.slug} />
    </label>
  </div>

  <label data-field>
    Upload files
    <FileInput bind:fileInput pasteFile={true} multiple={true} />
  </label>

  <FileField {record} fieldName="files" bind:toBeRemoved />

  <label data-field>
    Body
    <textarea bind:value={record.body} placeholder="Write your post content here..." rows="8"></textarea>
  </label>

  <button type="submit" aria-busy={$store}>
    <Spinner active={$store} />
    Save
  </button>
</form>

<style>
  .half {
    flex: 1 1 0;
  }
</style>
