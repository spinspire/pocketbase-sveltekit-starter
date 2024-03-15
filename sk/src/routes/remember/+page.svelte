<script lang="ts">
  import { metadata } from "$lib/app/stores";
  import Image from "$lib/components/Image.svelte";
  import { authModel, watch } from "$lib/pocketbase";
  import type { PostsResponse } from "$lib/pocketbase/generated-types";
  import { alertOnFailure } from "$lib/pocketbase/ui";
  import { client } from "$lib/pocketbase";
  import Markdown from "svelte-markdown";
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

  async function getFeaturedImageUrl(post: any) {
    if (post.featuredImage) {
      const image = await client.collection("images").getOne(post.featuredImage);
      if (image && image.file) {
        return client.getFileUrl(image, image.file);
      }
    }
    return 'https://via.placeholder.com/800x400.png?text=AI+Blog';
  }
</script>

<div class="bg-base-100">
  <div class="mx-auto flex max-w-7xl flex-col px-6 lg:px-8">
    <div
      class="grid max-w-none flex-grow grid-cols-1 gap-x-2 gap-y-20 overflow-y-auto lg:max-w-none lg:grid-cols-3 p-4"
      style="max-height: calc(100vh - 20rem);"
    >
      {#if $posts.items.length > 0}
        {#each $posts.items as post}
          <div
            class="card bg-base-300 flex w-full p-4 flex-col justify-between shadow-xl"
          >
            <div>
              <figure class="relative w-full">
                {#await getFeaturedImageUrl(post)}
                  <img src="https://via.placeholder.com/800x400.png?text=Loading..." alt="Loading..." class="object-cover w-full t-2xl aspect-[16/9] w-full object-cover sm:aspect-[2/1] lg:aspect-[3/2]" />
                {:then featuredImageUrl}
                  <img src={featuredImageUrl} alt={post.title} class="object-cover w-full t-2xl aspect-[16/9] w-full object-cover sm:aspect-[2/1] lg:aspect-[3/2]" />
                {/await}
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
                    class="text-primary prose-lg line-clamp-2 font-bold"
                    >{post.title}</a
                  >
                  <div
                    class="prose-sm text-base-content mt-3 line-clamp-6 text-justify"
                  >
                    <Markdown source={post.blogSummary} />
                  </div>
                </div>
              </div>
            </div>
            <div class="relative mb-4 flex-col gap-x-4 text-center">
              {#if post.tags && post.tags.length}
                {#each post.tags.split(',') as tag}
                  <a href="#" class="badge badge-outline badge-accent"
                    >{tag.trim()}</a
                  >
                {/each}
              {:else}
                <div class="badge badge-outline badge-accent">No tags</div>
              {/if}
            </div>
            <div class="flex justify-between p-2">
              <a class="btn btn-outline" href={`/posts/` + post.slug + `/edit`}>Edit</a>
              <a
                class="btn btn-outline btn-secondary"
                href={`${post.slug}#delete`}>Delete</a
              >
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
        <p>Please login to manage posts.</p>
      </div>
    {/if}
  </div>
</div>