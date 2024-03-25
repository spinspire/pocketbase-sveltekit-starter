<script lang="ts">
import { metadata } from "$lib/app/stores";
import { goto } from "$app/navigation";
import { authModel, save, watch } from "$lib/pocketbase";
import { alertOnFailure } from "$lib/pocketbase/ui";
import type { PageData } from "./$types";
import Markdown from "svelte-markdown";
import TagGroup from "$lib/components/TagGroup.svelte";
import { client } from "$lib/pocketbase";
import { onMount, createEventDispatcher } from "svelte";
import type { PostsResponse, Collections } from "$lib/pocketbase/generated-types";
import PostList from "$lib/components/PostList.svelte";

$: test = "";
$metadata.title = "inspire";
$metadata.description = "inspire ai";

const dispatch = createEventDispatcher();
let inputText = "";
let responseText = "";
let posts: PostsResponse[] = [];
let selectedService = "";
let selectedModel = "";

const services = [
  {
    name: "Anthropic",
    models: [
      "claude-3-haiku-20240307",
      "claude-3-sonnet-20240229",
      "claude-3-opus-20240229",
      "claude-2.1",
      "claude-2.0",
      "claude-instant-1.2",
    ],
  },
  {
    name: "OpenAI",
    models: ["gpt-4-turbo-preview", "gpt-3.5-turbo"],
  },
];

async function callAPI() {
  try {
    const response = await fetch(`/api/${selectedService.toLowerCase()}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: inputText, model: selectedModel }),
    });

    if (!response.ok) {
      throw new Error("Network response was not ok");
    }

    const data = await response.json();
    responseText = data.result;
  } catch (error) {
    responseText = "Error: " + (error as Error).message;
  }
}

onMount(async () => {
  // API calls from +page.ts
  try {
    const postsResponse = await client.collection("posts").getList(1, 50, {
      sort: "-updated",
      expand: "featuredImage,tags",
    });
    console.log("postsResponse", postsResponse);

    posts = postsResponse.items.map((post) => {
      const { expand, ...rest } = post;
      return {
        ...rest,
        title: post.title as string,
        slug: post.slug as string,
        body: post.body as string,
        tags: expand.tags ? expand.tags.map((tag: { title: string }) => tag.title) : [],
        collectionName: "posts" as Collections,
      };
    });
  } catch (error) {
    console.error("Error fetching posts:", error);
  }
});
</script>

Coming Soon

<div>
  <div>
  <label class="form-control w-full max-w-xs">
    <select class="select select-bordered" bind:value={selectedService}>
    <option value="">Select an AI</option>
    {#each services as service}
      <option value={service.name}>{service.name}</option>
    {/each}
  </select>
  </label>

  
  {#if selectedService}
  <label class="form-control w-full max-w-xs">
    <select class="select select-bordered" bind:value={selectedService}>
    <option value="">Select an model</option>
    {#each services.find(s => s.name === selectedService)?.models ?? [] as model}
        <option value={model}>{model}</option>
      {/each}
  </select>
  </label>
  {/if}
</div>

  <input type="text" bind:value={inputText} placeholder="Enter text" />
  <button on:click={callAPI} disabled={!selectedService || !selectedModel}
    >Submit</button
  >
</div>

<div>
  <p>Response:</p>
  <div class="response">{responseText}</div>
</div>

