<script lang="ts">
  import { alerts } from "$lib/components/Alerts.svelte";
  import FileInput from "$lib/components/FileInput.svelte";
  import Spinner, { activityStore } from "$lib/components/Spinner.svelte";
  import { authModel, client, save } from "$lib/pocketbase";
  import FileField from "$lib/pocketbase/FileField.svelte";
  import type { PostsResponse } from "$lib/pocketbase/generated-types.js";
  import z from "zod";

  const { data } = $props();
  let record = $state(data.record);
  let fileInput = $state() as HTMLInputElement;
  let toBeRemoved = $state([]);
  $effect(() => {
    data.metadata.title = data.metadata.headline = `Edit Post: ${record.title}`;
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
      const user = client.authStore.isAdmin ? "" : $authModel?.id;
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

<form onsubmit={store.run}>
  <output>ID: {record.id ?? "-"}</output>
  <div class="flex h">
    <div data-label="title">
      <input type="text" bind:value={record.title} />
    </div>
    <div data-label="slug">
      <input type="text" bind:value={record.slug} />
    </div>
    <div data-label="files">
      <FileInput bind:fileInput pasteFile={true} multiple={true} />
    </div>
  </div>
  <FileField {record} fieldName="files" bind:toBeRemoved />
  <div data-label="body">
    <textarea bind:value={record.body} placeholder="body"></textarea>
  </div>
  <button type="submit">
    <Spinner active={$store} />
    Save
  </button>
</form>
