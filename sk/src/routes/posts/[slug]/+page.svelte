<!-- <script lang="ts">
  import { base } from "$app/paths";
  import { page } from "$app/stores";
  import { metadata } from "$lib/app/stores";
  import Delete from "$lib/components/Delete.svelte";
  import { client } from "$lib/pocketbase";
  import type { PageData } from "./$types";
  import Markdown from "svelte-markdown";

  let featuredImageFix: string | undefined;
  let postsTagsFix: any[];

  export let data: PageData;

  $: ({ post: { id, title, slug, body, tags, blogSummary, featuredImage, prompt } } = data);
  $: $metadata.title = title;
</script>

<script lang="ts" context="module">
  export async function load({ params }: { params: { slug: string } }) {
    try {
      const post = await client.collection("posts").getFirstListItem(`slug = '${params.slug}'`);

      console.log("Loading post data...");
      //console.log("Data:", data);
      console.log("Post ID:", post.id);
      
      const postTagsRelations = await client.collection("postsTags").getFullList({ filter: `post_id = '${post.id}'` });
      console.log("Post Tags Relations:", postTagsRelations);

      const tagIds = postTagsRelations.map((rel) => rel.tag_id);
      console.log("Tag IDs:", tagIds);

      let postsTagsFix = await Promise.all(
        tagIds.map(async (tagId) => {
          const tag = await client.collection("tags").getOne(tagId);
          console.log("Tag:", tag);
          return tag;
        })
      );
      console.log("Posts Tags Fix:", postsTagsFix);

      let imageRecord = await client.collection("images").getOne(post.featuredImage);
      console.log("Image Record:", imageRecord);

      let featuredImageFix = client.files.getUrl(imageRecord, imageRecord.file);
      console.log("Featured Image Fix:", featuredImageFix);


      return {
        props: {
          post,
          postsTagsFix,
          featuredImageFix,
        },
      };
    } catch (error) {
      console.error("Failed to load post data:", error);
      return {
        props: {
          error: "Failed to load post data.",
        },
      };
    }
  }
</script>

{#if $page.url.hash === "#delete"}
  <Delete table="posts" id={id} />
{/if}

<div class="prose prose-sm sm:prose lg:prose-lg xl:prose-xl mx-auto p-4"> -->
<!-- {#if featuredImageFix} -->
<!-- <figure class="my-4">
      <img src={featuredImageFix} alt={title} class="mx-auto rounded-lg shadow-md" />
      <figcaption class="mt-2 text-center text-sm">{title}</figcaption>
    </figure>-->
<!-- {/if} -->
<!--
  <article class="prose lg:prose-lg mx-auto text-justify">
    <Markdown source={body} />
  </article>

  <div class="mt-8">
    <h2 class="text-2xl">Tags</h2>
    {#if Array.isArray(postsTagsFix)}
      <ul class="flex flex-wrap">
        {#each postsTagsFix as tag (tag.id)}
          <li class="mr-2">
            <a href={`${base}/tags/${tag.id}`} class="btn btn-sm btn-primary">
              {tag.name}
            </a>
          </li>
        {/each}
      </ul>
    {/if}
  </div>

  <div class="mt-8 text-center">
    <a href={`${base}/auditlog/posts/${id}`} class="btn btn-primary">
      Audit Log
    </a>
  </div>
</div> -->

<script lang="ts">
import { base } from "$app/paths";
import { page } from "$app/stores";
import { metadata } from "$lib/app/stores";
import Delete from "$lib/components/Delete.svelte";
import { client } from "$lib/pocketbase";
import type { PageData } from "./$types";
export let featuredImageUrl: string;
export let data: PageData;
import Markdown from "svelte-markdown";

$: if (data) {
  const {
    post: { id, title, slug, body, tags, blogSummary, featuredImage, prompt },
    featuredImageUrl: newFeaturedImageUrl,
  } = data;
  featuredImageUrl = newFeaturedImageUrl;
  $metadata.title = title;
}
console.log("On Load: [featuredImageUrl] ", featuredImageUrl);

let postsTagsFix: any[];
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

  <div class="mt-8">
    <h2 class="text-2xl">Tags</h2>
    {#if Array.isArray(postsTagsFix)}
      <ul class="flex flex-wrap">
        {#each postsTagsFix as tag (tag.id)}
          <li class="mr-2">
            <a href={`${base}/tags/${tag.id}`} class="btn btn-sm btn-primary">
              {tag.name}
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
