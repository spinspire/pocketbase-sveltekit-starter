<script lang="ts">
  import { client } from "$lib/pocketbase";
  import type { PostsResponse } from "$lib/pocketbase/generated-types";

  export let post: PostsResponse;
  export let alt: string = "";
  export let className: string = "";

  let imageUrl: string = "";

  async function loadImage() {
    if (post.expand?.featuredImage) {
      const image = post.expand.featuredImage as { file: string };
      
      if (image && image.file) {
        imageUrl = client.getFileUrl(post, image.file);
      }
    } else if (post.featuredImage) {
      const image = await client.collection("images").getOne(post.featuredImage);
      if (image && image.file) {
        imageUrl = client.getFileUrl(image, image.file);
      }
    }
  }

  $: post, loadImage(); // Reactive statement that depends on `post`
</script>

{#if imageUrl}
  <img src={imageUrl} alt={alt} class={className} />
{:else}
  <img src="https://via.placeholder.com/800x400.png?text=No+Image" alt={alt} class={className} />
{/if}