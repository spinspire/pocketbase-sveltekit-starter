<script lang="ts">
    import { client } from "$lib/pocketbase";
    import type { PostsResponse } from "$lib/pocketbase/generated-types";
  
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
  
  {#if tags.length > 0}
    <div class="mt-4 flex flex-wrap gap-2">
      {#each tags as tag}
        <a href={`/tags/${tag}`} class="badge badge-accent badge-outline">
          {tag}
        </a>
      {/each}
    </div>
  {:else}
    <div class="badge badge-accent badge-outline">No tags</div>
  {/if}