<script lang="ts">
  import { postsStore } from "$lib/stores/postStore";
  import type { PostsResponse } from "$lib/pocketbase/generated-types";
  import { metadata } from "$lib/app/stores";
  import Markdown from "svelte-markdown";
  import PostList from "$lib/components/PostList.svelte";

  let posts: PostsResponse[] = [];

  postsStore.subscribe((value) => {
    posts = value;
  });

  $metadata.title = "";
  $metadata.description = "AI powered note taking";
</script>

<div>
  <div class="mx-auto max-w-7xl px-6 lg:px-8">
    {#if Array.isArray(posts)}
      <div
        class="grid grid-cols-1 gap-x-2 gap-y-20 overflow-y-auto lg:grid-cols-3"
        style="max-height: calc(100vh - 220px);"
      >
        <PostList/>
      </div>
    {:else}
      <p>Error: Posts data is not available.</p>
    {/if}
  </div>
</div>