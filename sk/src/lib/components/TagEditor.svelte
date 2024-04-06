<script lang="ts">
import TagGroup from "$lib/components/TagGroup.svelte";
import type { PostsResponse } from "$lib/pocketbase/generated-types";
import { client } from "$lib/pocketbase";
import { onMount } from "svelte";

export let post: PostsResponse;
let tags: string[] = [];
let tagInput: string = "";

onMount(async () => {
  await loadTags();
  tagInput = tags.join(", ");
});

async function loadTags() {
  if (post.expand?.tags) {
    tags = post.expand.tags.map((tag: { title: any }) => tag.title);
  } else {
    const postsTagsResponse = await client
      .collection("postsTags")
      .getList(1, 50, {
        filter: `posts = "${post.id}"`,
      });
    const tagIds = postsTagsResponse.items.map((postTag) => postTag.tags);
    const loadedTags = await Promise.all(
      tagIds.map((tagId) => client.collection("tags").getOne(tagId))
    );
    tags = loadedTags.map((tag) => tag.title);
  }
}

$: {
  if (post) {
    loadTags();
  }
}

function handleInput(event: Event) {
  const input = (event.target as HTMLInputElement).value;
  tagInput = input;
  tags = input
    .split(",")
    .map((tag) => tag.trim())
    .filter((tag) => tag);
}

$: {
  if (post) {
    loadTags();
  }
}
</script>

<div class="mt-4">
  <input
    type="text"
    bind:value={tagInput}
    on:input={handleInput}
    class="input input-bordered w-full"
    placeholder="Enter tags separated by commas"
  />
</div>

<TagGroup post={post} tags={tags} />
