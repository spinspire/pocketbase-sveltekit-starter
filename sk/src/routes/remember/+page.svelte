<script lang="ts">
import { postsStore, fetchPosts } from "$lib/services/postService";
import type { PostsResponse } from "$lib/pocketbase/generated-types";
import { metadata } from "$lib/app/stores";
import PostList from "$lib/components/PostList.svelte";
import { onMount } from "svelte";
let posts: PostsResponse[] = [];
postsStore.subscribe((value) => {
  posts = value.posts;
});
$metadata.title = "";
$metadata.description = "AI powered note taking";
// Fetch posts when the component is mounted
onMount(async () => {
  await fetchPosts();
});
</script>

<div>
  <div class="mx-auto max-w-7xl px-6 lg:px-8">
    {#if Array.isArray(posts)}
      <div
        class="grid grid-cols-1 gap-x-2 gap-y-20 overflow-y-auto lg:grid-cols-3"
        style="max-height: calc(100vh - 220px);"
      >
        <PostList posts={posts} />
      </div>
    {:else}
      <p>Error: Posts data is not available.</p>
    {/if}
  </div>
</div>
