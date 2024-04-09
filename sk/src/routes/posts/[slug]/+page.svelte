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
    try {
      post = await fetchPostBySlug(slug);
      if (!post) {
        console.log("Post not found");
        // Handle the case when the post is not found
        // For example, you can redirect to a 404 page or show an error message
      }
    } catch (error) {
      console.error("Error fetching post:", error);
      // Handle the error case
      // For example, you can show an error message to the user
    }
  });
</script>

{#if post}
  <div class="prose prose-sm sm:prose lg:prose-lg xl:prose-xl mx-auto p-4">
    {#if post.featuredImage}
      <figure class="my-4">
        <img src={post.featuredImage} alt={post.title} class="mx-auto rounded-lg shadow-md" />
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