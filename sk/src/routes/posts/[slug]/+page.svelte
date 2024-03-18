<script lang="ts">
import { base } from "$app/paths";
import { page } from "$app/stores";
import { metadata } from "$lib/app/stores";
import Delete from "$lib/components/Delete.svelte";
import { client } from "$lib/pocketbase";
import type { PageData } from "./$types";
import Markdown from "svelte-markdown";
export let data: PageData;
export let featuredImageUrl: string;
let postsTagsFix: any[];
$: if (data) {
  const {
    post: {
      userid,
      id,
      title,
      slug,
      body,
      blogSummary,
      featuredImage,
      prompt,
      tags,
    },
    featuredImageUrl: newFeaturedImageUrl,
    tags: newPostsTagsFix,
  } = data;
  featuredImageUrl = newFeaturedImageUrl;
  postsTagsFix = newPostsTagsFix;
  $metadata.title = title;
}
console.log("On Load: [featuredImageUrl] ", featuredImageUrl);
</script>

{#if $page.url.hash === "#delete"}
  <Delete table="posts" id={data.post.id} />
{/if}

<div class="prose prose-sm sm:prose lg:prose-lg xl:prose-xl mx-auto p-4">
  {#if featuredImageUrl}
    <figure class="my-4">
      <img
        src={featuredImageUrl}
        alt={data.post.title}
        class="mx-auto rounded-lg shadow-md"
      />
      <figcaption class="mt-2 text-center text-sm">
        {data.post.title}
      </figcaption>
    </figure>
  {/if}
  <article class="prose lg:prose-lg mx-auto text-justify">
    <Markdown source={data.post.body} />
  </article>
  <!-- Inside your Svelte component -->
  <div class="mt-8">
    <h2 class="text-2xl">Tags</h2>
    {#if Array.isArray(data.tags)}
      <ul class="flex flex-wrap">
        {#each data.tags as tag (tag.id)}
          <li class="mr-2">
            <a href={`${base}/tags/${tag.id}`} class="btn btn-primary btn-sm">
              {tag.title}
            </a>
          </li>
        {/each}
      </ul>
    {/if}
  </div>
  <div class="mt-8 text-center">
    <a href={`${base}/auditlog/posts/${data.post.id}`} class="btn btn-primary">
      Audit Log
    </a>
  </div>
</div>
