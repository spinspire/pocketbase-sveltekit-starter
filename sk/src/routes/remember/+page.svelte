<script lang="ts">
  import { metadata } from "$lib/app/stores";
  import { authModel } from "$lib/pocketbase";
  import { alertOnFailure } from "$lib/pocketbase/ui";
  import { client } from "$lib/pocketbase";
  import Markdown from "svelte-markdown";
  import { goto } from "$app/navigation";
  
  export let data;
  
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
  
  async function getFeaturedImageUrl(post: any) {
    if (post.featuredImage) {
      const image = await client.collection("images").getOne(post.featuredImage);
      if (image && image.file) {
        return client.getFileUrl(image, image.file);
      }
    }
    return "https://via.placeholder.com/800x400.png?text=AI+Blog";
  }
</script>

<div class="bg-base-100">
  <div class="mx-auto max-w-7xl px-6 lg:px-8">
    <div
      class="grid grid-cols-1 gap-x-2 gap-y-20 overflow-y-auto p-4 lg:grid-cols-3"
      style="max-height: calc(100vh - 20rem);"
    >
      {#if data.posts.length > 0}
        {#each data.posts as post}
          <div class="card flex flex-col justify-between bg-base-300 p-4 shadow-xl">
            <div>
              <figure class="relative">
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
              <div class="mt-4">
                <div class="prose items-center gap-x-4">
                  <time datetime={post.updated} class="text-accent">
                    {new Date(post.updated).toLocaleDateString()}
                  </time>
                </div>
                <div class="group relative mt-3">
                  <a
                    href={`/posts/${post.slug}`}
                    class="prose-lg font-bold text-primary line-clamp-2"
                  >
                    {post.title}
                  </a>
                  <div class="prose-sm mt-3 text-base-content line-clamp-6">
                    <Markdown source={post.blogSummary} />
                  </div>
                </div>
              </div>
              <div class="mt-4 flex flex-wrap gap-2">
                {#each post.tags as tag}
                  <a href={`/tags/${tag}`} class="badge badge-accent badge-outline">
                    {tag}
                  </a>
                {:else}
                  <div class="badge badge-accent badge-outline">No tags</div>
                {/each}
              </div>
            </div>
            
            <div class="mt-4 flex justify-between">
              <a class="btn btn-outline" href={`/posts/${post.slug}/edit`}>Edit</a>
              <a class="btn btn-outline btn-secondary" href={`/posts/${post.slug}#delete`}>Delete</a>
            </div>
          </div>
        {/each}
      {:else}
        <div class="col-span-full py-8 text-center">No posts found.</div>
      {/if}
    </div>

    {#if $authModel}
      <div class="my-4 text-right">
        <button class="btn btn-error ml-2" on:click={deleteAllPosts}>
          Delete All Posts
        </button>
      </div>
    {:else}
      <div class="my-4 text-center">
        <p>Please login to manage posts.</p>
      </div>
    {/if}
  </div>
</div>