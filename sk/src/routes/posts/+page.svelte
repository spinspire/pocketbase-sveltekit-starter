<script lang="ts">
import { metadata } from "$lib/app/stores";
import Image from "$lib/components/Image.svelte";
import { authModel, watch } from "$lib/pocketbase";
import type { PostsResponse } from "$lib/pocketbase/generated-types";
import { alertOnFailure } from "$lib/pocketbase/ui";
import { client } from "$lib/pocketbase";
import Markdown from "svelte-markdown";
import { onMount } from "svelte";
import { postsStore } from "$lib/stores/postStore";
import { fetchPosts } from "$lib/services/postService";
import { goto } from "$app/navigation";

async function getFeaturedImageUrl(post: any) {
    if (post.featuredImage) {
      const image = await client.collection("images").getOne(post.featuredImage);
      if (image && image.file) {
        return client.getFileUrl(image, image.file);
      }
    }
    return "https://via.placeholder.com/800x400.png?text=AI+Blog";
  }

async function deleteAllPosts() {
  alertOnFailure(async () => {
    const postsResponse = await client.collection("posts").getList();
    for (const post of postsResponse.items) {
      await client.collection("posts").delete(post.id);
    }
    // Optionally, refresh the posts list or navigate as needed
  });
}

$metadata.title = "";
$metadata.description = "AI powered note taking";

let posts: PostsResponse[] = [];

onMount(async () => {
  await fetchPosts();
});

postsStore.subscribe((value) => {
  posts = value;
});
</script>

{#each posts as post (post.id)}
    <div
      class="card bg-base-300 flex w-full flex-col justify-between p-4 shadow-xl"
    >
      <div>
        <figure>
          {#await getFeaturedImageUrl(post)}
            <img
              src="https://via.placeholder.com/800x400.png?text=Loading..."
              alt="Loading..."
              class="aspect-[16/9] w-full object-cover sm:aspect-[2/1] lg:aspect-[3/2]"
            />
          {:then featuredImageUrl}
            <img
              src={featuredImageUrl}
              alt={post.title}
              class="aspect-[16/9] w-full object-cover sm:aspect-[2/1] lg:aspect-[3/2]"
            />
          {/await}
        </figure>
        <div class="m-4 max-w-xl">
          <div class="prose items-center gap-x-4">
            <!-- <time datetime="2020-03-16" class="text-accent">
              {new Date(post.updated).toLocaleDateString()}
            </time> -->
          </div>
          <div class="group relative mt-3">
            <a
              href={`/posts/${post.slug}`}
              class="prose-lg text-primary line-clamp-2 font-bold"
            >
              {post.title}
            </a>
            <div
              class="prose-sm text-base-content mt-3 line-clamp-6 text-justify"
            >
              <Markdown source={post.blogSummary || post.body} />
            </div>
          </div>
        </div>
      </div>
    </div>
  {/each}

{#if posts.length === 0}
  <div
    class="card bg-base-300 flex w-full flex-col justify-between p-4 shadow-xl"
  >
    <div>
      <div class="m-4 max-w-xl">
        <div class="prose items-center gap-x-4">
          <div class="text-accent">No posts found</div>
        </div>
      </div>
    </div>
  </div>
{/if}
