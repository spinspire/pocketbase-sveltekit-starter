<script lang="ts">
import type { PostsResponse } from "$lib/pocketbase/generated-types";
import { onMount } from "svelte";
import { page } from "$app/stores";
import { metadata } from "$lib/app/stores";
import Delete from "$lib/components/Delete.svelte";
import { client } from "$lib/pocketbase";
import type { PageData } from "./$types";
import Markdown from "svelte-markdown";
import { base } from "$app/paths";

export let featuredImageUrl: string = "";
export let tags: PostsResponse[] = [];
let post: PostsResponse | undefined;

import TagGroup from "$lib/components/TagGroup.svelte";

onMount(async () => {
  //initialize post, featuredImageUrl, and tags
  // API calls from +page.ts
  const { slug } = $page.params;

  try {
    const response = await client.collection("posts").getList(1, 1, {
      filter: `slug = '${slug}'`,
      expand: "featuredImage,tags",
    });
    const items = response.items;

    if (items.length === 0) {
      throw new Error("Post not found");
    }
    post = items[0] as unknown as PostsResponse;
    console.log("post", post);

    if (post.featuredImage) {
      const image = await client
        .collection("images")
        .getOne(post.featuredImage);
      if (image && image.file) {
        featuredImageUrl = client.getFileUrl(image, image.file);
      }
    }

    if (post.expand?.tags) {
      tags = post.expand.tags;
    }
  } catch (error) {
    console.error("Error fetching post:", error);
  }
});
</script>

{#if post !== undefined}
  {#if $page.url.hash === "#delete"}
    <Delete table="posts" id={post.id} />
  {/if}

  <div class="prose prose-sm sm:prose lg:prose-lg xl:prose-xl mx-auto p-4">
    {#if featuredImageUrl}
      <figure class="my-4">
        <img
          src={featuredImageUrl}
          alt={post.title}
          class="mx-auto rounded-lg shadow-md"
        />
        <figcaption class="mt-2 text-center text-sm">
          {post.title}
        </figcaption>
      </figure>
    {/if}
    <article class="prose lg:prose-lg mx-auto text-justify">
      <Markdown source={post.body} />
    </article>
    <!-- Inside your Svelte component -->
    <div class="mt-8">
      <h2 class="text-2xl">Tags</h2>

      <TagGroup post={post} />
    </div>
    <div class="mt-8 text-center">
      <a href={`${base}/auditlog/posts/${post.id}`} class="btn btn-primary">
        Audit Log
      </a>
    </div>
  </div>
{/if}
