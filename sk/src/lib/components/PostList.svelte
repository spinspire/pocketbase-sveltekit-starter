<script lang="ts">
  import { onMount } from "svelte";
  import type { PostsResponse } from "$lib/pocketbase/generated-types";
  import { postsStore } from "$lib/stores/postStore";
  import { fetchPosts } from "$lib/services/postService";
  import PostCard from "./PostCard.svelte";

  let posts: PostsResponse[] = [];

  onMount(async () => {
    await fetchPosts(page, perPage);
  });

  postsStore.subscribe((value) => {
    posts = value;
  });

  let page = 1;
  let perPage = 20;
  let loading = false;
  let reachedEnd = false;

  async function loadMore() {
    if (!loading && !reachedEnd) {
      loading = true;
      page++;
      await fetchPosts(page, perPage);
      loading = false;
    }
  }

  function handleIntersect(entries: IntersectionObserverEntry[]) {
    if (entries[0].isIntersecting && !loading) {
      loadMore();
    }
  }
</script>

{#each posts as post (post.id)}
    <PostCard {post} />
  {/each}

  {#if loading}
    <p>Loading...</p>
  {/if}

  {#if !loading && posts.length === 0}
    <p>No posts found.</p>
  {/if}

  <div use:inview={handleIntersect}></div>