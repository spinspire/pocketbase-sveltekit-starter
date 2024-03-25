<script lang="ts">
import type { PostsResponse } from "$lib/pocketbase/generated-types";
import PostCard from "./PostCard.svelte";
export let posts: PostsResponse[];
import { client, authModel } from "$lib/pocketbase";
import { alertOnFailure } from "$lib/pocketbase/ui";

async function deleteAllPosts() {
  alertOnFailure(async () => {
    const postsResponse = await client.collection("posts").getList();
    for (const post of postsResponse.items) {
      await client.collection("posts").delete(post.id);
    }
    // Optionally, refresh the posts list or navigate as needed
  });
}
</script>

<div
  class="grid grid-cols-1 gap-x-2 gap-y-20 overflow-y-auto lg:grid-cols-3"
  style="max-height: calc(100vh - 15rem);"
>
  {#if posts.length > 0}
    {#each posts as post}
      <PostCard post={post} />
    {/each}
  {:else}
    <div class="col-span-full py-8 text-center">No posts found.</div>
  {/if}
</div>

{#if $authModel}
  <div class="my-4 text-right">
    <!-- <button class="btn btn-error ml-2" on:click={deleteAllPosts}>
      Delete All Posts
    </button> -->
  </div>
{:else}
  <div class="my-4 text-center">
    <p>Please login to manage posts.</p>
  </div>
{/if}
