<script lang="ts">
import { metadata } from "$lib/app/stores";
import Image from "$lib/components/Image.svelte";
import { authModel, watch } from "$lib/pocketbase";
import type { PostsResponse } from "$lib/pocketbase/generated-types";
import { alertOnFailure } from "$lib/pocketbase/ui";
import { client } from "$lib/pocketbase";
import Markdown from "svelte-markdown";
import { onMount } from "svelte";
import { goto } from "$app/navigation";

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


const posts = watch<PostsResponse>("posts", {
  sort: "-updated",
});

onMount(async () => {
  try {
    const postsResponse = await client.collection("posts").getList(1, 50, {
      sort: "-updated",
      expand: "featuredImage,tags",
    });

    posts.update(() => postsResponse.items);
  } catch (error) {
    console.error("Error fetching posts:", error);
  }
});
</script>

{#if $posts.items.length > 0}
  {#each $posts.items as post}
    <div
      class="card bg-base-300 flex w-full flex-col justify-between p-4 shadow-xl"
    >
      <div>
        <figure class="relative w-full">
          <img
            src={post.featuredImage}
            alt={post.title}
            class="aspect-[16/9] w-full object-cover sm:aspect-[2/1] lg:aspect-[3/2]"
          />
        </figure>
        <div class="m-4 max-w-xl">
          <div class="prose items-center gap-x-4">
            <time datetime="2020-03-16" class="text-accent">
              {new Date(post.updated).toLocaleDateString()}
            </time>
          </div>
          <div class="group relative mt-3">
            <a
              href={import.meta.env.VITE_APP_SK_URL + "/posts/" + post.slug}
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
      {#each $posts.items as post}
        <!-- ... other post markup ... -->
        <div class="relative mb-4 flex-col gap-x-4 text-center"></div>
        <!-- ... other post markup ... -->
      {/each}
      <!-- The rest of your component... -->
    </div>
  {/each}
{/if}

{#if $posts.items.length === 0}
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
