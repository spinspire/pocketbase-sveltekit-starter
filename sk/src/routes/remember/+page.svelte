<script lang="ts">
import { onMount } from "svelte";
import { client, authModel } from "$lib/pocketbase";
import { metadata } from "$lib/app/stores";
import Markdown from "svelte-markdown";
import { goto } from "$app/navigation";
import {
  generateTextFromChatGPT,
  generateImageFromDalle,
} from "$lib/utils/api";
import TagGroup from "$lib/components/TagGroup.svelte";
  import ServiceForm from "$lib/components/ServiceForm.svelte";
import PostList from "$lib/components/PostList.svelte";
import type { PostsResponse } from "$lib/pocketbase/generated-types";

//export const data;

let responseText = '';


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
let posts: string | any[] = [];

//export let post: PostsResponse;

onMount(async () => {
  // API calls from +page.ts
  try {
    const postsResponse = await client.collection("posts").getList(1, 50, {
      sort: "-updated",
      expand: "featuredImage,tags",
    });

    console.log("postsResponse", postsResponse);

    posts = postsResponse.items.map((post) => ({
      ...post,
      tags: post.expand.tags
        ? post.expand.tags.map((tag: { title: any }) => tag.title)
        : [],
    }));

    console.log("postsFinal", posts);
  } catch (error) {
    console.error("Error fetching posts:", error);
  }
});

function handleSubmit(event: { detail: { selectedService: any; selectedModel: any; inputText: any; }; }) {
    const { selectedService, selectedModel, inputText } = event.detail;
    // Call your API with the selected service, model, and input text
    // Update responseText with the result from the API
  }
</script>


<div>
  <div class="mx-auto max-w-7xl px-6 lg:px-8">
    {#if Array.isArray(posts)}
      <PostList {posts} />
    {:else}
      <p>Error: Posts data is not available.</p>
    {/if}
  </div>
</div>
