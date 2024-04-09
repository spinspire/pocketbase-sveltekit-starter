<script lang="ts">
import { client } from "$lib/pocketbase";
import type { PostsResponse } from "$lib/pocketbase/generated-types";

export let post: PostsResponse;
export let alt: string = "";
export let className: string = "";
</script>

<!-- Image.svelte -->
{#if post.expand?.featuredImage}
  {@const imageRecord = post.expand.featuredImage}
  {@const imageUrl = imageRecord && imageRecord.file ? client.getFileUrl(imageRecord, imageRecord.file) : ''}
  <img src={imageUrl} alt={alt} class={className} />
{:else}
  <img
    src="https://via.placeholder.com/800x400.png?text=No+Image"
    alt={alt}
    class={className}
  />
{/if}
