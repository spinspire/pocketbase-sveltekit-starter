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
import ServiceSelector from "$lib/components/ServiceSelector.svelte";
import { availableServices } from "$lib/utils/api";
import InterpretationList from "$lib/components/InterpretationList.svelte";
import LoadingIndicator from "$lib/components/LoadingIndicator.svelte";
import PostContent from "$lib/components/PostContent.svelte";
import TagGroup from "$lib/components/TagGroup.svelte";
import { fly } from "svelte/transition";
import { serviceModelSelectionStore } from "$lib/app/stores";
import PostList from "$lib/components/PostList.svelte";
import ImageWall from "$lib/components/ImageWall.svelte";

import { createPost } from "$lib/services/postService";

const dispatch = createEventDispatcher();
let inputText = "";

let selectedService = availableServices[0]?.name;
let selectedModel = availableServices[0]?.models?.[0];
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
let currentTags = "";
let createdPost: PostsResponse | undefined;
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
let posts: string | any[] = [];
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
  isAuthenticated = !!$authModel;
  client.autoCancellation(false);
});
async function uploadImageAndSavePost(
  base64Image: string,
  currentTags: string
): Promise<void> {
  try {
    console.log("Uploading image and saving post...");
    const imageBlob = await fetch(`data:image/png;base64,${base64Image}`).then(
      (res) => res.blob()
    );
    if (imageBlob.size > 5242880) {
      throw new Error("Image size exceeds the maximum limit of 5MB.");
    }
    loadingMessage = "Uploading image...";
    const formData = new FormData();
    formData.append("file", imageBlob, "postImage.png");
    console.log("Uploading image...");
    post.userid = $authModel?.id || "";
    loadingMessage = "Saving post...";
    const createdImageRecord = await client
      .collection("images")
      .create(formData);
    console.log("Image uploaded:", createdImageRecord);
    post.featuredImage = createdImageRecord.id;
    console.log("Current Tags:", currentTags);
    const tagsArray = currentTags
      .split(",")
      .map((tag) => tag.trim())
      .filter((tag) => tag);
    console.log("Tags array:", tagsArray);
    loadingMessage = "Saving tags...";
    const tagIds = await ensureTagsExist(tagsArray);
    console.log("Tag IDs:", tagIds);
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
    loadingMessage = "Saving final post...";
    createdPost = (await save(
      "posts",
      postToCreate,
      true
    )) as unknown as PostsResponse;
    console.log("Post created:", createdPost);
    goto(`${import.meta.env.VITE_APP_SK_URL}/posts/${post.slug}`);
  } catch (error) {
    console.error(`Failed to upload image and save post: ${error}`);
    alertOnFailure(() => `Failed to upload image and save post: ${error}`);
  }
}
$: {
  updateProgressBar(currentStep);
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
  currentStep = 1;
  try {
    // Show loading screen
    isLoading.content = true;
    loadingMessage = "Generating interpretations...";

    const interpretationsResponse = (inputText = introPrompt + promptString);
    await callAPI();
    console.log("Interpretations Response:", interpretationsResponse);
    originalPrompt = promptString;
    chatGptInts = parseInterpretations(responseText);
    console.log(chatGptInts);
    formSubmitted = true;
  } catch (error) {
    console.error("Error generating interpretations:", error);
  } finally {
    // Hide loading screen
    isLoading.content = false;
  }
}

function parseInterpretations(completionText: string) {
  if (!completionText) {
    console.error("No completion text found.");
    return [];
  }

  // Hardcoded array of image URLs
  const imageUrls = {
    Optimistic: "/img/optimistic.png",
    Pessimistic: "/img/pessimistic.png",
    Realistic: "/img/realistic.png",
    Creative: "/img/creative.png",
    Analytical: "/img/analytical.png",
    "Devil's Advocate": "/img/advocate.png",
  };

  // Split the input text into lines and process each line to extract the required details
  const interpretations = completionText
    .trim()
    .split("\n")
    .filter((line) => line.trim().length > 0)
    .map((line) => {
      // Extract the title and text
      const title = line.split(":")[0].trim();
      const text = line.substring(line.indexOf(":") + 1).trim();

      // Return the new format
      return {
        title,
        text,
        imageUrl:
          imageUrls[title as keyof typeof imageUrls] || "default-image.jpg", // Fallback to a default image if the title does not match
      };
    });

  console.log(interpretations);
  return interpretations;
}

function getCompletions(claudeOutput: string): string {
  const jsonObject = JSON.parse(claudeOutput);
  if (!jsonObject.hasOwnProperty("completion")) {
    throw new Error("Parsed JSON object does not contain a 'completion' key.");
  }
  const completionText = jsonObject.completion;
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

  const generateContent = async (
    prompt: string,
    property: keyof typeof post
  ) => {
    loadingMessage = `Generating ${property}...`;
    inputText = prompt;
    await callAPI();
    if (property === "tags") {
      currentTags = responseText;
    } else {
      post[property] = responseText.replace(/\["'\]/g, "") as never;
    }
    currentStep += 10;
  };

  try {
    post.userid = $authModel?.id || "";

    // Generate body
    await generateContent(`${promptFormat}'${userPrompt}'`, "body");

    // Generate title
    await generateContent(`${titlePrompt}'${post.body}'`, "title");

    // Generate tags
    await generateContent(`${tagPrompt}'${post.body}'`, "tags");

    // Generate blog summary
    await generateContent(`${blogSummaryPrompt}'${post.body}'`, "blogSummary");

    console.log("Title:", post.title);
    console.log("Tags:", currentTags);
    post.slug = post.title
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/\["':\]/g, "")
      .substring(0, 50);
    post.prompt = userPrompt;

    loadingMessage = "Generating image...";
    inputText = `${imagePrompt}'${post.body}'`;
    await callAPI();
    const base64Image = await generateImageFromDreamStudio(responseText);
    currentStep = 60;

    console.log("Post:", post);
    loadingMessage = "Saving post...";
    await createPost(post);

      goto(`${import.meta.env.VITE_APP_SK_URL}/posts/${post.slug}/inspire`);
    } catch (error) {
      alertOnFailure(() => error);
      throw error;
    } finally {
    isLoading.content = false;
    isLoading.title = false;
    isLoading.slug = false;
    isLoading.summary = false;
    isLoading.image = false;
  }
}

function handleInterpretationSelect(
  event: CustomEvent<{ interpretation: string }>
) {
  const interpretation = event.detail.interpretation;
  selectInterpretation(interpretation);
}
function goBack() {
  formSubmitted = false;
}
let isGeneratingBlog = false;
function selectInterpretation(interpretation: string) {
  chatGptPrompt = originalPrompt + " - " + interpretation;
  isGeneratingBlog = true;
  chatGptInts = [];
  // Clear the chatGptInts array before generating the blog
  isLoading.content = true;
  loadingMessage = "Generating blog...";
  generateBlogFromChatGPT(chatGptPrompt)
    .then(() => {
      isLoading.content = false;
      isGeneratingBlog = false;
    })
    .catch((error) => {
      alertOnFailure(error);
      isLoading.content = false;
      isGeneratingBlog = false;
    });
}
</script>

<div>
  {#if !formSubmitted}
    {#if isLoading.content}
      <LoadingIndicator message="Loading interpretations..." />
    {:else}
      <main
        class="container mx-auto my-12 px-4 sm:px-6 lg:px-8"
        in:fly={{ y: 50, duration: 500 }}
      >
        <form
          on:submit|preventDefault={() => generateGptInterpretations(chatGptPrompt)}
          class="bg-base-200 space-y-6 rounded-lg p-6 shadow"
        >
          <ServiceSelector
            bind:selectedService={selectedService}
            bind:selectedModel={selectedModel}
          />

          <input
            type="text"
            class="input input-bordered bg-base-100 w-full"
            bind:value={chatGptPrompt}
            placeholder="Enter thoughts here"
          />
          <div class="text-right">
            <button type="submit" class="btn btn-primary">Generate</button>
          </div>
        </form>
      </main>
      <ImageWall></ImageWall>
    {/if}
  {:else if chatGptInts.length > 0 && !isGeneratingBlog}
    <main
      class="container mx-auto my-12 px-4 sm:px-6 lg:px-8"
      in:fly={{ y: 50, duration: 500 }}
    >
      <InterpretationList
        interpretations={chatGptInts}
        on:select={handleInterpretationSelect}
        on:back={goBack}
      />
    </main>
  {:else if isGeneratingBlog}
    <LoadingIndicator message={loadingMessage} />
  {:else}
    {#key chatGptPrompt}
      {#if post !== undefined}
        <div
          class="prose prose-sm sm:prose lg:prose-lg xl:prose-xl mx-auto p-4"
          in:fly={{ y: 50, duration: 500 }}
        >
          {#if post.featuredImage}
            <figure class="my-4">
              <img
                src={post.featuredImage}
                alt={post.title}
                class="mx-auto rounded-lg shadow-lg transition duration-300 ease-in-out hover:scale-105"
              />
              <figcaption class="mt-2 text-center text-sm">
                {post.title}
              </figcaption>
            </figure>
          {/if}

          <article class="prose lg:prose-lg mx-auto text-justify">
            {#if isLoading.content}
              <LoadingIndicator message="Loading content..." />
            {:else}
              <PostContent content={post.body} />
            {/if}
          </article>

          <div class="mt-8">
            <h2 class="text-2xl">Tags</h2>
            {#if isLoading.tags}
              <LoadingIndicator message="Loading tags..." />
            {:else if createdPost}
              <TagGroup post={createdPost} />
            {/if}
          </div>
        </div>
      {/if}
    {/key}
  {/if}
</div>
