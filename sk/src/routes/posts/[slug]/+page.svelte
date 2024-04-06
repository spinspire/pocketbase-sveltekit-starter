<script lang="ts">
  import { page } from "$app/stores";
  import { onMount } from "svelte";
  import { postsStore } from "$lib/stores/postStore";
  import { fetchPostBySlug } from "$lib/services/postService";
  import type { PostsResponse } from "$lib/pocketbase/generated-types";
  import Markdown from "svelte-markdown";
  import TagGroup from "$lib/components/TagGroup.svelte";

  let post: PostsResponse | undefined;

  $: slug = $page.params.slug;

  onMount(async () => {
    if (!$postsStore.length) {
      await fetchPostBySlug(slug);
    }
  });

  $: post = $postsStore.find((p) => p.slug === slug);
</script>

{#if post}
  <div class="prose prose-sm sm:prose lg:prose-lg xl:prose-xl mx-auto p-4">
    {#if post.featuredImage}
      <figure class="my-4">
        <img
          src={post.featuredImage}
          alt={post.title}
          class="mx-auto rounded-lg shadow-md"
        />
        <figcaption class="mt-2 text-center text-sm">{post.title}</figcaption>
      </figure>
    {/if}
    <article class="prose lg:prose-lg mx-auto">
      <Markdown source={post.body} />
    </article>

    <div class="mt-8">
      <h2 class="text-2xl">Tags</h2>
      <TagGroup post={post} />
    </div>
  </div>
{:else}
  <p>Loading post...</p>
{/if}