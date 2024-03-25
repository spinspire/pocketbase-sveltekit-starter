<script lang="ts">
  import { fade, scale } from 'svelte/transition';
  import { client } from "$lib/pocketbase";
  import type { PostsResponse, PostsRecord } from "$lib/pocketbase/generated-types";
  export let post: PostsResponse;

  let tags: string[] = [];

  async function loadTags() {
    if (post.expand?.tags) {
      tags = post.expand.tags.map((tag: { title: any; }) => tag.title);
    } else {
      const postsTagsResponse = await client.collection("postsTags").getList(1, 50, {
        filter: `posts = "${post.id}"`,
      });

      const tagIds = postsTagsResponse.items.map((postTag) => postTag.tags);
      const loadedTags = await Promise.all(tagIds.map((tagId) => client.collection("tags").getOne(tagId)));
      tags = loadedTags.map((tag) => tag.title);
    }
  }

  $: {
    if (post) {
      loadTags();
    }
  }
</script>

<style>
  .tag:hover {
    transform: translateY(-5px);
    transition: transform 0.3s ease;
  }
</style>

{#if tags.length > 0}
  <div class="px-6 pt-4 pb-2 flex flex-wrap" in:fade={{ duration: 400 }}>
    {#each tags as tag, i (tag)}
  {#if i < 2}
    <a href={`/tags/${tag}`} 
       class="tag inline-block bg-primary rounded-full px-2 py-1 text-sm font-semibold text-primary-content mr-2 mb-2 cursor-pointer hover:bg-primary-focus" 
       in:scale={{ delay: i * 100, duration: 500 }}
       out:fade={{ duration: 300 }}>
      #{tag}
    </a>
  {/if}
{/each}

  </div>
{:else}
  <div class="px-6 pt-4 pb-2 text-sm font-semibold" in:fade={{ duration: 400 }}>No tags</div>
{/if}
