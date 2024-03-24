<script lang="ts">
import { metadata } from "$lib/app/stores";
import { goto } from "$app/navigation";
import { authModel, save, watch } from "$lib/pocketbase";
import { alertOnFailure } from "$lib/pocketbase/ui";
import type { PageData } from "./$types";
import Markdown from "svelte-markdown";
import ThemeSwitch from "$lib/components/ThemeSwitch.svelte";
import TagGroup from "$lib/components/TagGroup.svelte";
import { client } from "$lib/pocketbase";
import { onMount, createEventDispatcher } from "svelte";
import type { PostsResponse } from "$lib/pocketbase/generated-types";

$: test = "";
$metadata.title = "inspire";
$metadata.description = "inspire ai";

const dispatch = createEventDispatcher();
let inputText = "";
let responseText = "";
let posts: string | any[] = [];
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
</script>

<ThemeSwitch></ThemeSwitch>
Coming Soon

<div>
  <select bind:value={selectedService}>
    <option value="">Select a service</option>
    {#each services as service}
      <option value={service.name}>{service.name}</option>
    {/each}
  </select>

  {#if selectedService}
    <select bind:value={selectedModel}>
      <option value="">Select a model</option>
      {#each services.find(s => s.name === selectedService)?.models ?? [] as model}
        <option value={model}>{model}</option>
      {/each}
    </select>
  {/if}

  <input type="text" bind:value={inputText} placeholder="Enter text" />
  <button on:click={callAPI} disabled={!selectedService || !selectedModel}
    >Submit</button
  >
</div>

<div>
  <p>Response:</p>
  <div class="response">{responseText}</div>
</div>

{#each posts as post}
  <div
    class="card bg-base-300 flex w-full flex-col justify-between p-4 shadow-xl"
  >
    <div>
      <figure class="relative w-full">
        <img
          src={post.featuredImage}
          alt={post.title}
          class="aspect-[16/9] w-full object-cover sm:aspect-[2/1] lg:aspect-[3/2]"
        />
      </figure>
      <div class="m-4 max-w-xl">
        <div class="prose items-center gap-x-4">
          <time datetime="2020-03-16" class="text-accent">
            {new Date(post.updated).toLocaleDateString()}
          </time>
          <h2 class="text-2xl font-bold">{post.title}</h2>
          <Markdown source={post.content} />
          <TagGroup post={post}></TagGroup>
        </div>
      </div>
    </div>
  </div>
{/each}
