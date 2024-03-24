<script lang="ts">
import { goto } from "$app/navigation";
import { authModel, client, save } from "$lib/pocketbase";
import { marked } from "marked";
import { alertOnFailure } from "$lib/pocketbase/ui";
import {
  promptFormat,
  titlePrompt,
  tagPrompt,
  blogSummaryPrompt,
  imagePrompt,
  introPrompt,
} from "$lib/utils/prompts";
import { onMount } from "svelte";
import {
  generateTextFromChatGPT,
  generateTextFromClaude,
  generateImageFromDreamStudio,
  ensureTagsExist,
} from "$lib/utils/api";

import type {
  PostsResponse,
  PostsRecord,
  TagsResponse,
} from "$lib/pocketbase/generated-types";

import { createEventDispatcher } from "svelte";

const dispatch = createEventDispatcher();
let selectedService = "";
let selectedModel = "";
let inputText = "";

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

// Initialize states and reactive variables
let isLoading = {
  content: false,
  title: false,
  tags: false,
  summary: false,
  image: false,
  slug: false,
};
let formSubmitted = false;
let loadingMessage = "";
let currentStep = 0;
let chatGptInts: any[] = [];
let originalPrompt = "";
let base64Image;
let curTags = "";
let isAuthenticated = false;

let post: PostsRecord = {
  title: "",
  slug: "",
  body: "",
  blogSummary: "",
  featuredImage: "",
  prompt: "",
  userid: "",
  tags: [] as string[],
};

$: chatGptPrompt = "";

const engineId = "stable-diffusion-v1-6";
const apiHost = "https://api.stability.ai";
const apiKey = import.meta.env.VITE_STABILITY_API_KEY;
let responseText = "";

if (!apiKey) {
  console.error("Missing Stability API key.");
  throw new Error("Missing Stability API key.");
}

async function callAPI() {
  // Emit an event with the selected service, model, and input text
  try {
    console.log("Calling API...");
    const response = await fetch(`/api/${selectedService.toLowerCase()}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: inputText, model: selectedModel }),
    });
    console.log("Response:", response);

    if (!response.ok) {
      throw new Error("Network response was not ok");
    }

    const data = await response.json();
    console.log("Data:", data);
    responseText = data.result;
  } catch (error) {
    responseText = "Error: " + (error as Error).message;
  }
}

onMount(async () => {
  isAuthenticated = !!authModel;
  client.autoCancellation(false);
});

async function uploadImageAndSavePost(
  base64Image: string,
  curTags: string
): Promise<void> {
  try {
    console.log("Uploading image and saving post...");

    // Convert base64 to Blob
    const imageBlob = await fetch(`data:image/png;base64,${base64Image}`).then(
      (res) => res.blob()
    );

    // Check image size
    if (imageBlob.size > 5242880) {
      throw new Error("Image size exceeds the maximum limit of 5MB.");
    }

    // Prepare form data for image upload
    const formData = new FormData();
    formData.append("file", imageBlob, "postImage.png");

    console.log("Uploading image...");

    // Prepare post data
    post.userid = $authModel?.id || "";

    // Upload image and create image record
    const createdImageRecord = await client
      .collection("images")
      .create(formData);

    console.log("Image uploaded:", createdImageRecord);

    post.featuredImage = createdImageRecord.id;

    console.log("CurTags:", curTags);

    // Process tags
    const tagsArray = curTags
      .split(",")
      .map((tag) => tag.trim())
      .filter((tag) => tag);

    console.log("Tags array:", tagsArray);

    // Ensure tags exist in the `tags` collection and get their IDs
    const tagIds = await ensureTagsExist(tagsArray);

    console.log("Tag IDs:", tagIds);

    // Prepare post data
    const postToCreate = {
      title: post.title,
      slug: post.slug,
      body: post.body,
      blogSummary: post.blogSummary,
      featuredImage: createdImageRecord.id,
      userid: $authModel?.id || "",
      prompt: post.prompt,
      tags: tagIds,
    };

    console.log("Post to create:", postToCreate);

    // Create post record
    const createdPost = await save("posts", postToCreate, true);

    console.log("Post created:", createdPost);

    // Redirect to the new post
    goto(`${import.meta.env.VITE_APP_SK_URL}/posts/${post.slug}`);
  } catch (error) {
    console.error(`Failed to upload image and save post: ${error}`);
    alertOnFailure(() => `Failed to upload image and save post: ${error}`);
  }
}

function updateProgressBar(step: number) {
  const progressElement = document.querySelector(
    ".progress"
  ) as HTMLProgressElement;
  if (progressElement) {
    progressElement.value = step;
  }
}

async function generateGptInterpretations(promptString: string) {
  if (!$authModel?.id) {
    alert("Please log in to save your post.");
    return;
  }

  updateProgressBar(1);

  try {
    //const interpretationsResponse = await generateTextFromClaude(
    //  introPrompt + promptString
    //);

    const interpretationsResponse = (inputText = introPrompt + promptString);

    await callAPI();

    console.log("Interpretations Response:", interpretationsResponse);

    originalPrompt = promptString;

    chatGptInts = parseInterpretations(responseText);
    console.log(chatGptInts);

    formSubmitted = true;
  } catch (error) {
    console.error("Error generating interpretations:", error);
    //alertOnFailure(() => `Failed to generate interpretations: ${error.message}`);
  }
}

function parseInterpretations(completionText: string): string[] {
  // Check if completionText is undefined or null
  if (!completionText) {
    console.error("No completion text found.");
    return [];
  }
  console.log(completionText);
  // Split based on newline to separate each perspective, trim each, and remove any that are empty or just whitespace
  const interpretations = completionText
    .trim()
    .split("\n")
    .filter((line) => line.trim().length > 0)
    .map((line) => line.trim());

  console.log(interpretations);
  return interpretations;
}

function getCompletions(claudeOutput: string): string {
  const jsonObject = JSON.parse(claudeOutput);

  // Validate that the jsonObject contains the 'completion' key
  if (!jsonObject.hasOwnProperty("completion")) {
    throw new Error("Parsed JSON object does not contain a 'completion' key.");
  }

  const completionText = jsonObject.completion;
  // Additional check to ensure completionText is a string
  if (typeof completionText !== "string") {
    throw new Error("'completion' key does not contain a string value.");
  }

  return completionText;
}

async function generateBlogFromChatGPT(userPrompt: string) {
  if (!$authModel?.id) {
    alert("Please log in to save your post.");
    return;
  }

  currentStep = 0;
  try {
    isLoading.content = true;
    post.userid = $authModel?.id || "";
    loadingMessage = "Generating post content...";
    inputText = `${promptFormat}'${userPrompt}'`;
    await callAPI();
    /* let bodyResponse = await generateTextFromClaude(
      `${promptFormat}'${userPrompt}'`
    ); */
    post.body = responseText;
    const bodyResponse = post.body;
    updateProgressBar(10);
    isLoading.content = false;

    isLoading.title = true;
    loadingMessage = "Generating post title...";
    inputText = `${titlePrompt}'${bodyResponse}'`;
    await callAPI();
    /*  const titleResponse = getCompletions(
      await generateTextFromClaude(`${titlePrompt}'${bodyResponse}'`)
    ); */
    post.title = responseText.replace(/["']/g, "");
    const titleResponse = post.title;
    updateProgressBar(20);
    isLoading.title = false;

    isLoading.slug = true;
    post.slug = titleResponse
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/["':]/g, "")
      .substring(0, 50);
    post.prompt = userPrompt;
    isLoading.slug = false;

    loadingMessage = "Generating post tags...";
    inputText = `${tagPrompt}'${bodyResponse}'`;
    await callAPI();
    /* curTags = getCompletions(
      await generateTextFromClaude(`${tagPrompt}'${bodyResponse}'`)
    ); */
    curTags = responseText;

    updateProgressBar(30);
    console.log("Tags:", curTags);

    isLoading.summary = true;
    loadingMessage = "Generating post summary...";
    inputText = `${blogSummaryPrompt}'${bodyResponse}'`;
    await callAPI();
    /* const blogSummaryResponse = getCompletions(
      await generateTextFromClaude(`${blogSummaryPrompt}'${bodyResponse}'`)
    ); */
    post.blogSummary = responseText;
    updateProgressBar(40);
    isLoading.summary = false;

    console.log("Generating post image...");
    isLoading.image = true;
    loadingMessage = "Generating post image...";

    inputText = `${imagePrompt}'${bodyResponse}'`;
    await callAPI();
    const dStudioPrompt = responseText;

    

    const base64Image = await generateImageFromDreamStudio(dStudioPrompt);

    // await generateTextFromClaude(`${imagePrompt}'${bodyResponse}'`)

    updateProgressBar(60);
    isLoading.image = false;

    // Save post with image and tags
    loadingMessage = "Saving post...";
    await uploadImageAndSavePost(base64Image, curTags);
    console.log("Post saved.");
  } catch (error) {
    alertOnFailure(() => error);
    isLoading.content = false;
    isLoading.title = false;
    isLoading.slug = false;
    isLoading.summary = false;
    isLoading.image = false;
    isLoading.image = false;
  }

  return {
    title: post.title,
    slug: post.slug,
    body: post.body,
    tags: post.tags,
    blogSummary: post.blogSummary,
    featuredImage: post.featuredImage,
    prompt: userPrompt,
    userid: post.userid,
  };
}

function goBack() {
  formSubmitted = false;
}

function selectInterpretation(interpretation: string) {
  chatGptPrompt = originalPrompt + " - " + interpretation;

  isLoading.content = true;
  loadingMessage = "Generating blog...";
  generateBlogFromChatGPT(chatGptPrompt)
    .then(() => {
      isLoading.content = false;
    })
    .catch((error) => {
      alertOnFailure(error);
      isLoading.content = false;
    });
  chatGptInts = [];
}
</script>

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

  <!--   <input type="text" bind:value={inputText} placeholder="Enter text" />
  <button on:click={callAPI} disabled={!selectedService || !selectedModel}>
    Submit
  </button> -->
</div>

<div>
  {#if !formSubmitted}
    <main class="container mx-auto my-12 px-4 sm:px-6 lg:px-8">
      <form
        on:submit|preventDefault={() => generateGptInterpretations(chatGptPrompt)}
      >
        <div class="bg-base-200 space-y-6 rounded-lg p-6 shadow">
          <textarea
            class="textarea textarea-bordered h-40 w-full resize-none"
            bind:value={chatGptPrompt}
            rows="10"
            placeholder="Enter thoughts here"
          ></textarea>
          <div class="text-right">
            <button type="submit" class="btn btn-primary">Generate</button>
          </div>
        </div>
      </form>
    </main>
  {:else if chatGptInts.length > 0}
    <main class="container mx-auto my-12 px-4 sm:px-6 lg:px-8">
      <section class="space-y-6">
        <div class="mb-4 text-xl font-semibold">Select an interpretation:</div>
        <div class="flex flex-wrap gap-2">
          {#each chatGptInts as interpretation}
            <button
              class="btn btn-outline"
              on:click={() => selectInterpretation(interpretation)}
              >{interpretation}</button
            >
          {/each}
        </div>
        <button class="btn btn-secondary mt-6" on:click={goBack}>Back</button>
      </section>
    </main>
  {:else}
    <div class="mt-12 flex flex-col items-center space-y-4">
      {#if isLoading.content}
        <div>
          <svg
            class="h-8 w-8 animate-spin text-gray-800"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              class="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              stroke-width="4"
            ></circle>
            <path
              class="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          <p class="text-lg font-medium">Loading content...</p>
          <progress class="progress progress-primary w-56" value="1" max="100"
          ></progress>
        </div>
      {:else}
        <div class="mt-4">
          {@html marked(post.body || "")}
        </div>
      {/if}

      {#if isLoading.title}
        <div>
          <svg
            class="h-8 w-8 animate-spin text-gray-800"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              class="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              stroke-width="4"
            ></circle>
            <path
              class="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          <p class="text-lg font-medium">Loading title...</p>
          <progress class="progress progress-primary w-56" value="1" max="100"
          ></progress>
        </div>
      {:else}
        <div class="mt-4">
          <h2 class="text-2xl font-bold">{post.title}</h2>
        </div>
      {/if}

      {#if isLoading.slug}
        <div>
          <svg
            class="h-8 w-8 animate-spin text-gray-800"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              class="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              stroke-width="4"
            ></circle>
            <path
              class="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          <p class="text-lg font-medium">Loading slug...</p>
          <progress class="progress progress-primary w-56" value="1" max="100"
          ></progress>
        </div>
      {:else}
        <div class="mt-4">
          <p>{post.slug}</p>
        </div>
      {/if}

      {#if isLoading.tags}
        <div>
          <svg
            class="h-8 w-8 animate-spin text-gray-800"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              class="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              stroke-width="4"
            ></circle>
            <path
              class="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          <p class="text-lg font-medium">Loading tags...</p>
          <progress class="progress progress-primary w-56" value="1" max="100"
          ></progress>
        </div>
      {:else}
        <div class="mt-4">
          <p>{curTags}</p>
        </div>
      {/if}

      {#if isLoading.summary}
        <div>
          <svg
            class="h-8 w-8 animate-spin text-gray-800"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              class="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              stroke-width="4"
            ></circle>
            <path
              class="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          <p class="text-lg font-medium">Loading summary...</p>
          <progress class="progress progress-primary w-56" value="1" max="100"
          ></progress>
        </div>
      {:else}
        <div class="mt-4">
          <p>{post.blogSummary}</p>
        </div>
      {/if}

      {#if isLoading.image}
        <div>
          <svg
            class="h-8 w-8 animate-spin text-gray-800"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              class="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              stroke-width="4"
            ></circle>
            <path
              class="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          <p class="text-lg font-medium">Loading image...</p>
          <progress class="progress progress-primary w-56" value="1" max="100"
          ></progress>
        </div>
      {:else}
        <div class="mt-4">
          <img
            src={post.featuredImage}
            alt={post.title}
            class="h-auto w-full rounded-lg"
          />
        </div>
      {/if}
    </div>
  {/if}
</div>
