<script lang="ts">
  import type { PostsResponse } from "$lib/pocketbase/generated-types";

  export let post: PostsResponse;
  export let alt: string = "";
  export let className: string = "";
</script>

{#if post.featuredImage}
  <img src={post.featuredImage} {alt} class={className} />
{:else}
  <img src="https://via.placeholder.com/800x400.png?text=No+Image" {alt} class={className} />
{/if}