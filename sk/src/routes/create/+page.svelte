<script lang="ts">
import { goto } from "$app/navigation";
import { authModel, save } from "$lib/pocketbase";
import type { PageData } from "./$types";
import Anthropic from "@anthropic-ai/sdk";
import {
  promptFormat,
  titlePrompt,
  tagPrompt,
  blogSummaryPrompt,
  imagePrompt,
} from "$lib/utils/prompts";


// Initialize states and reactive variables
let isLoadingGptContent = false;
let isLoadingGptTitle = false;
let isLoadingGptTags = false;
let isLoadingGptSummary = false;
let isLoadingDalleImage = false;
let formSubmitted = false;
let loadingMessage = "";
let currentStep = 0; // Add a reactive variable to track the current step

// Simplify and consolidate reactive statements
$: post = {
  title: "",
  slug: "",
  body: "",
  tags: [],
  blogSummary: "",
  featuredImage: "",
  user: $authModel?.id || "",
  interpretations: [],
};

$: chatGptPrompt = "";




// Utility function to handle API requests
async function apiRequest(endpoint: string, method: string, body: any) {
  const response = await fetch(endpoint, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    const errorMessage = await response.text();
    throw new Error(errorMessage);
  }
  return response.json();
}

function resetLoadingStates() {
  isLoadingGptContent = false;
  isLoadingGptTitle = false;
  isLoadingGptTags = false;
  isLoadingGptSummary = false;
  isLoadingDalleImage = false;
}

// Simplified and refactored version of saveBlog, generateImageFromDalle, and generateFromChatGPT functions
async function saveBlog() {
  if (!post.user) {
    alert("Please log in to save your post.");
    return;
  }
  try {
    await save("posts", post);
    goto(`${import.meta.env.VITE_APP_BASE_URL}/posts/${post.slug}`);
  } catch (error) {
    alertOnFailure(error);
  }
}

function userIsAuthenticated() {
  // Assuming there's a global state or a utility that can check the current user's authentication status
  return $authModel?.id; // Replace this with your actual authentication check
}

function showAlert(message: any, type: string) {
  // Simple example using browser's alert
  // For a better user experience, replace this with your UI framework's alert system
  alert(`${type.toUpperCase()}: ${message}`);
}

async function generateImageFromDalle(prompt: string) {
  try {
    const data = await apiRequest("/api/dalle", "POST", { prompt });
    post.featuredImage = data.url;
  } catch (error) {
    alertOnFailure(error);
  }
}

async function generateImageFromSD(prompt: string) {
  try {
    const data = await apiRequest("/api/dreamstudio", "POST", { prompt });
    post.featuredImage = data.url;
  } catch (error) {
    alertOnFailure(error);
  }
}

// Updated Progress Bar Update Function
function updateProgressBar(step: number) {
  const progressElement = document.querySelector(
    ".progress"
  ) as HTMLProgressElement;
  if (progressElement) {
    progressElement.value = step;
  }
}

// Updated Function to Accept a Prompt String
async function generateGptInterpretations(promptString: string) {
  if (!$authModel?.id) {
    alert("Please log in to save your post.");
    return;
  }

  updateProgressBar(1); // Begin the process with initial progress

  try {
    // Use the provided `promptString` instead of `post.prompt`
    const interpretationsResponse = await generateGptRequest(
      `Interpret this statement and provide three different ideas that are one sentence long, separated by a comma, make sure to separate each complete idea by a comma: '${promptString}'`
    );

    const interpretationsArray = interpretationsResponse
      .split(",")
      .map((interpretation: string) => interpretation.trim());

    // Assign the array of interpretations directly to `post.interpretations`
    post.interpretations = interpretationsArray;
    formSubmitted = true;
  } catch (error) {
    alertOnFailure(error);
  } finally {
  }
}

export async function generateBlogFromChatGPT(userPrompt: string) {
  if (!$authModel?.id) {
    alert("Please log in to save your post.");
    return;
  }

  resetLoadingStates();
  currentStep = 0; // Reset the step at the start

  try {
    // Generate the main content of the post using ChatGPT
    isLoadingGptContent = true;
    loadingMessage = "Generating post content...";
    let bodyResponse = await generateGptRequest(
      `${promptFormat}This is the user's inspiration: '${userPrompt}'`
    );
    if (bodyResponse === null) {
      throw new Error("Failed to generate body response");
    }

    post.body = bodyResponse;
    updateProgressBar(10);
    isLoadingGptContent = false;
    isLoadingGptTitle = true;
    loadingMessage = "Generating post title...";
    const titleResponse = await generateGptRequest(
      `${titlePrompt}This is the user's article: '${bodyResponse}'`
    );
    post.title = titleResponse.replace(/["']/g, "");
    updateProgressBar(20);
    isLoadingGptTitle = false;

    // Generate a slug for the URL
    isLoadingGptTags = true;
    loadingMessage = "Generating post slug...";
    post.slug = titleResponse
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/["':]/g, "")
      .substring(0, 50);

    // Generate tags for the post
    loadingMessage = "Generating post tags...";
    const tagsResponse = await generateGptRequest(
      `${tagPrompt}This is the blog article: '${bodyResponse}'`
    );
    post.tags = tagsResponse; // Assuming the tagsResponse is a comma-separated string
    updateProgressBar(30);
    isLoadingGptTags = false;

    // Generate a summary for the blog post
    isLoadingGptSummary = true;
    loadingMessage = "Generating post summary...";
    const blogSummaryResponse = await generateGptRequest(
      `${blogSummaryPrompt}This is the blog article: '${bodyResponse}'`
    );
    post.blogSummary = blogSummaryResponse;
    updateProgressBar(40);
    isLoadingGptSummary = false;

    isLoadingDalleImage = true;
    loadingMessage = "Generating post image prompt...";
    const imagePromptText = await generateGptRequest(
      `${imagePrompt}This is the blog article summary: '${blogSummaryResponse}'`
    );
    updateProgressBar(50);

    // Optionally generate an image for the post
    loadingMessage = "Generating post image...";
    //await generateImageFromDalle(titleResponse);
    await generateImageFromSD(imagePromptText);
    updateProgressBar(60);
    isLoadingDalleImage = false;

    // Save the post
    loadingMessage = "Saving post...";
    await saveBlog();
  } catch (error) {
    alertOnFailure(error);
    // Reset all loading states in case of an error
    isLoadingGptContent = false;
    isLoadingGptTitle = false;
    isLoadingGptTags = false;
    isLoadingGptSummary = false;
    isLoadingDalleImage = false;
    return null;
  }

  // Return the post object for further use or confirmation
  return {
    title: post.title,
    slug: post.slug,
    body: post.body,
    tags: post.tags,
    blogSummary: post.blogSummary,
    featuredImage: post.featuredImage,
  };
}

// Note: Implement `generateGptRequest` and `alertOnFailure` as needed.
async function generateGptRequest(prompt: string) {
  const response = await fetch("/api/chatgpt", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt }),
  });
  if (!response.ok) throw new Error("Failed to generate text from ChatGPT");
  const data = await response.json();
  return data.result; // Assuming the response has a 'result' field
}

// Helper function for better error handling and user feedback
function alertOnFailure(error: any) {
  console.error("Error:", error);
  alert(error instanceof Error ? error.message : "An unknown error occurred");
}

function goBack() {
  formSubmitted = false;
}

function selectInterpretation(interpretation: string) {
  chatGptPrompt = interpretation;
  // Start loading here
  isLoadingGptContent = true; // Assuming this is the first step in generating the blog
  loadingMessage = "Generating blog...";
  generateBlogFromChatGPT(interpretation)
    .then(() => {
      isLoadingGptContent = false; // Reset or update loading states as necessary when done
    })
    .catch((error) => {
      alertOnFailure(error); // Handle errors
      isLoadingGptContent = false; // Ensure loading state is reset on error
    });
}
</script>

<div>
  {#if isLoadingGptContent || isLoadingGptTitle || isLoadingGptTags || isLoadingGptSummary || isLoadingDalleImage}
    <div class="mt-12 flex flex-col items-center space-y-4">
      <!-- Simplified SVG Spinner - Removed nested <svg> tags -->
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
      <p class="text-lg font-medium">{loadingMessage}</p>
      <progress class="progress progress-primary w-56" value="1" max="100"
      ></progress>
      <div class="mt-4">
        <p>{post.body}</p>
      </div>
      <div class="mt-4">
        <h2 class="text-2xl font-bold">{post.title}</h2>
      </div>
      <div class="mt-4">
        <p>{post.slug}</p>
      </div>
      <div class="mt-4">
        <div class="mb-4 flex flex-wrap gap-2">
          {#if post.tags && post.tags.length}
            {#if typeof post.tags === 'string'}
              {#each post.tags.split(',') as tag}
                <a href="#" class="badge badge-outline badge-accent"
                  >{tag.trim()}</a
                >
              {/each}
            {/if}
          {/if}
        </div>
      </div>
      <div class="mt-4">
        <p>{post.blogSummary}</p>
      </div>

      <div class="mt-4">
        <img
          src={post.featuredImage}
          alt={post.title}
          class="h-auto w-full rounded-lg"
        />
      </div>
    </div>
  {:else if !formSubmitted}
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
  {:else}
    <main class="container mx-auto my-12 px-4 sm:px-6 lg:px-8">
      <section class="space-y-6">
        {#if post.interpretations.length > 0}
          <div class="mb-4 text-xl font-semibold">
            Select an interpretation:
          </div>
          <div class="flex flex-wrap gap-2">
            {#each post.interpretations as interpretation}
              <button
                class="btn btn-outline"
                on:click={() => selectInterpretation(interpretation)}
                >{interpretation}</button
              >
            {/each}
          </div>
        {/if}
        <button class="btn btn-secondary mt-6" on:click={goBack}>Back</button>
      </section>
    </main>
  {/if}
</div>
