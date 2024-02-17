<script lang="ts">
import { metadata } from "$lib/app/stores";
import Image from "$lib/components/Image.svelte";
import { authModel, watch } from "$lib/pocketbase";
import type { PostsResponse } from "$lib/pocketbase/generated-types";
import { alertOnFailure } from "$lib/pocketbase/ui";
import { client } from "$lib/pocketbase";

async function deleteAllPosts() {
  alertOnFailure(async () => {
    const postsResponse = await client.collection("posts").getList();
    for (const post of postsResponse.items) {
      await client.collection("posts").delete(post.id);
    }
    // Optionally, refresh the posts list or navigate as needed
  });
}

$metadata.title = "remember";
$metadata.description = "AI powered note taking";
const posts = watch<PostsResponse>("posts", {
  sort: "-updated",
});
</script>

<div class="bg-base-100">
  <div class="mx-auto max-w-7xl px-6 lg:px-8">
    {#if $authModel}
      <div class="my-4">
        <a class="btn btn-primary" href="new/edit">Create New</a>
      </div>
    {:else}
      <div class="my-4 text-center">
        <p>Please login to create new posts.</p>
      </div>
    {/if}
    <div
      class="mx-auto mt-8 grid max-w-2xl grid-cols-1 gap-x-8 gap-y-20 lg:mx-0 lg:max-w-none lg:grid-cols-3"
    >
      {#if $posts.items.length > 0}
        {#each $posts.items as post}
          <div
            class="bg-base-primary m-4 flex flex-col justify-between rounded-xl"
          >
            <div>
              <div class="relative w-full">
                <figure>
                  <img
                    src={post.featuredImage || 'https://via.placeholder.com/800x400.png?text=AI+Blog'} 
                    alt="Featured Pic"
                    class="aspect-[16/9] w-full rounded-t-2xl object-cover sm:aspect-[2/1] lg:aspect-[3/2]"
                  />
                </figure>
              </div>
              <div class="m-4 max-w-xl">
                <div class="prose items-center gap-x-4">
                  <time datetime="2020-03-16" class="text-accent">
                    {new Date(post.updated).toLocaleDateString()}
                  </time>
                </div>
                <div class="group relative mt-3">
                  <a class="prose prose-lg text-primary line-clamp-2 font-bold" href={"http://localhost:5173/posts/" + `${post.slug}`}>{post.title}</a>
                  <div class="prose prose-sm text-base-content mt-5">
                    {post.blogSummary}
                  </div>
                </div>
              </div>
            </div>
            <div class="">
              <div class="relative mb-4 flex-col gap-x-4 text-center">
                {#if post.tags && post.tags.length}
                  {#each post.tags.split(',') as tag}
                    <!-- svelte-ignore a11y-invalid-attribute -->
                    <a href="#" class="badge text-accent">{tag.trim()}</a>
                  {/each}
                {:else}
                  <div class="badge text-accent">No tags</div>
                {/if}
              </div>

              <div class="flex justify-between p-2">
                <div>
                  <a class="btn btn-outline" href={`${post.id}/edit`}>Edit</a>
                </div>
                <div>
                  <a
                    class="btn btn-outline btn-secondary"
                    href={`${post.slug}#delete`}>Delete</a
                  >
                </div>
              </div>
            </div>
          </div>
        {/each}
      {:else}
        <div class="col-span-full py-8 text-center">No posts found.</div>
      {/if}
    </div>

    {#if $authModel}
      <div class="my-4 text-right">
        <button class="btn btn-error ml-2" on:click={deleteAllPosts}
          >Delete All Posts</button
        >
      </div>
    {:else}
      <div class="my-4 text-center">
        <p>Please login to create new posts.</p>
      </div>
    {/if}
  </div>
</div>

<style>
</style>
