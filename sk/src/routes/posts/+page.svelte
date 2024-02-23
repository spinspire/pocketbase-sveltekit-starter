<script lang="ts">
import { metadata } from "$lib/app/stores";
import Image from "$lib/components/Image.svelte";
import { authModel, watch } from "$lib/pocketbase";
import type { PostsResponse } from "$lib/pocketbase/generated-types";
import { alertOnFailure } from "$lib/pocketbase/ui";
import { client } from "$lib/pocketbase";
import Markdown from 'svelte-markdown';
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
      class="grid gap-x-2 gap-y-20 mx-auto mt-8 max-w-none grid-cols-1 lg:grid-cols-3 lg:max-w-none"
    >
      {#if $posts.items.length > 0}
        {#each $posts.items as post}
          <div class="flex flex-col justify-between m-4 card w-72 bg-base-200 shadow-xl">
            <div>
              <figure class="relative w-full">
                <img
                  src={post.featuredImage || 'https://via.placeholder.com/800x400.png?text=AI+Blog'}
                  alt={post.title}
                  class="object-cover w-full  t-2xl aspect-[16/9] sm:aspect-[2/1] lg:aspect-[3/2]"
                />
              </figure>
              <div class="max-w-xl m-4">
                <div class="items-center gap-x-4 prose">
                  <time datetime="2020-03-16" class="text-accent">
                    {new Date(post.updated).toLocaleDateString()}
                  </time>
                </div>
                <div class="relative mt-3 group">
                  <a
                    href={"http://localhost:5173/posts/" + post.slug}
                    class="text-primary font-bold line-clamp-2 prose-lg"
                  >{post.title}</a>
                  <div class="mt-3 text-justify line-clamp-6 prose-sm text-base-content">
                    <Markdown source={post.blogSummary} />
                  </div>
                </div>
              </div>
            </div>
            <div class="text-center relative mb-4 flex-col gap-x-4">
              {#if post.tags && post.tags.length}
                {#each post.tags.split(',') as tag}
                  <a href="#" class="badge badge-outline badge-accent">{tag.trim()}</a>
                {/each}
              {:else}
                <div class="badge badge-outline badge-accent">No tags</div>
              {/if}
            </div>
            <div class="flex justify-between p-2">
              <a class="btn btn-outline" href={`${post.id}/edit`}>Edit</a>
              <a
                class="btn btn-outline btn-secondary"
                href={`${post.slug}#delete`}
              >Delete</a>
            </div>
          </div>
        {/each}
      {:else}
        <div class="py-8 text-center col-span-full">No posts found.</div>
      {/if}
    </div>

    {#if $authModel}
      <div class="my-4 text-right">
        <button class="btn btn-error ml-2" on:click={deleteAllPosts}>Delete All Posts</button>
      </div>
    {:else}
      <div class="my-4 text-center">
        <p>Please login to manage posts.</p>
      </div>
    {/if}
  </div>
</div>


<style>
</style>
