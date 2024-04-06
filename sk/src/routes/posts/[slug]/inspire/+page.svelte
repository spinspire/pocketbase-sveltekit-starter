<script lang="ts">
import type { PostsResponse } from "$lib/pocketbase/generated-types";
import { onMount } from "svelte";
import { page } from "$app/stores";
import { metadata } from "$lib/app/stores";
import Delete from "$lib/components/Delete.svelte";
import { authModel, client, save } from "$lib/pocketbase";
import type { PageData } from "./$types";
import Markdown from "svelte-markdown";
import { base } from "$app/paths";
import TagGroup from "$lib/components/TagGroup.svelte";
import { serviceModelSelectionStore } from "$lib/app/stores";
import ServiceSelector from "$lib/components/ServiceSelector.svelte";
import { availableServices } from "$lib/utils/api";
import { generateBlog, generateBlogResponse } from "$lib/services/generateBlog";
import type { ServiceModelSelection } from "$lib/services/generateBlog";
import { postsStore } from "$lib/stores/postStore";
  import { fetchPostBySlug } from "$lib/services/postService";
export let featuredImageUrl: string = "";
let selectedService = availableServices[0].name;
let selectedModel = availableServices[0].models[0];
let post: PostsResponse | undefined;
let selectedBullets: string[] = [];

let processedBody = "";


$: slug = $page.params.slug;

  onMount(async () => {
    post = $postsStore.find((p) => p.slug === slug);
    if (!post) {
      await fetchPostBySlug(slug);
      post = $postsStore.find((p) => p.slug === slug);
    }
  });

const getSeedPrompt = () => {
  let seedPrompt = selectedBullets.join("/n ");
  return seedPrompt;
};

function handleServiceChange(event: CustomEvent<string>) {
  selectedService = event.detail;
  serviceModelSelectionStore.update((store) => ({
    ...store,
    selectedService: selectedService,
  }));
}

function handleModelChange(event: CustomEvent<string>) {
  selectedModel = event.detail;
  serviceModelSelectionStore.update((store) => ({
    ...store,
    selectedModel: selectedModel,
  }));
}

function toggleBullet(bullet: string) {
  if (selectedBullets.includes(bullet)) {
    selectedBullets = selectedBullets.filter((b) => b !== bullet);
  } else {
    selectedBullets = [...selectedBullets, bullet];
  }
}

function parseBulletPoints(
  text: string
): { heading: string; bullets: string[] }[] {
  const sections: { heading: string; bullets: string[] }[] = [];
  const lines = text.split("\n");

  let currentHeading = "";
  let currentBullets: string[] = [];

  for (const line of lines) {
    if (line.startsWith("#")) {
      if (currentHeading && currentBullets.length > 0) {
        sections.push({ heading: currentHeading, bullets: currentBullets });
      }
      currentHeading = line.replace(/^#+\s*/, "").trim();
      currentBullets = [];
    } else if (line.match(/^\s*[-*]\s+(.+)/)) {
      const bullet = line.replace(/^\s*[-*]\s+/, "").trim();
      currentBullets.push(bullet);
    }
  }

  if (currentHeading && currentBullets.length > 0) {
    sections.push({ heading: currentHeading, bullets: currentBullets });
  }

  return sections;
}

$: if (post) {
  processedBody = post.body.replace(/^(#+)\s+(.*)/gm, (match, p1, p2) => {
    const level = p1.length;
    const fontSize = `text-${4 - level + 1}xl`;
    const classes = `${fontSize} font-bold mb-4`;
    return `<h${level} class="${classes}">${p2}</h${level}>`;
  });
}
</script>

<main class="prose prose-sm sm:prose lg:prose-lg xl:prose-xl mx-auto p-4">
  <ServiceSelector
    bind:selectedService={selectedService}
    bind:selectedModel={selectedModel}
    on:serviceChange={handleServiceChange}
    on:modelChange={handleModelChange}
  />
  {#if post}
    {#if featuredImageUrl}
      <figure class="my-4">
        <img
          src={featuredImageUrl}
          alt={post.title}
          class="mx-auto rounded-lg shadow-md"
        />
        <figcaption class="mt-2 text-center text-sm">{post.title}</figcaption>
      </figure>
    {/if}

    <h1 class="mb-4 text-4xl font-bold">{post.title}</h1>

    <section class="mt-8">
      <button
        class="btn btn-block mt-2 text-center"
        on:click={() => selectedBullets = []}
      >
        Clear Selection
      </button>
      <div class="mt-8">
        {#each parseBulletPoints(post.body) as section}
          <h2 class="text-2xl font-bold">{section.heading}</h2>
          {#if section.bullets.length > 0}
            <ul class="list-disc pl-6">
              {#each section.bullets as bullet (bullet)}
                <li class="mb-2">
                  <button
                    class={`bullet-point flex cursor-pointer items-baseline px-4 py-2 text-left hover:bg-primary transition duration-200 ease-in-out ${selectedBullets.includes(bullet) ? 'bg-primary text-primary-content' : ''}`}
                    on:click={() => toggleBullet(bullet)}
                    aria-label={`Bullet point: ${bullet}`}
                    type="button"
                  >
                    {bullet}
                  </button>
                </li>
              {/each}
            </ul>
          {:else}
            <p>No key takeaways found in this section.</p>
          {/if}
        {/each}
      </div>
    </section>
    <div class="align-right mt-8">
      <button
        class="btn btn-block mt-2 text-center"
        on:click={() => {
        if ($serviceModelSelectionStore && post) {
          generateBlogResponse(getSeedPrompt(), post.id, authModel);
        } else {
          console.error('Service model selection is not set');
        }
      }}
      >
        Generate Inspiration
      </button>
    </div>

    <div class="">
      <h2 class="w-screen text-2xl">Tags</h2>
      <TagGroup post={post} />
    </div>

    <div class="mt-8 text-center">
      <a href={`${base}/auditlog/posts/${post.id}`} class="btn btn-primary">
        Audit Log
      </a>
    </div>
  {/if}
</main>

<style>
</style>
