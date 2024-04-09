<script lang="ts">
import type { PostsResponse } from "$lib/pocketbase/generated-types";
import PostCard from "$lib/components/PostCard.svelte";
export let posts: PostsResponse[] = [];
</script>

{#if Array.isArray(posts)}
  {#each posts as post (post.id)}
    <PostCard post={post} />
  {/each}
{:else}
  <p>Error: Posts data is not available.</p>
{/if}
