<script lang="ts">
import { goto } from "$app/navigation";
import { authModel, client, save } from "$lib/pocketbase";
import type { PageData } from "./$types";
import { apiRequest } from "$lib/utils/api";
import { marked } from "marked";
import {
  promptFormat,
  titlePrompt,
  tagPrompt,
  blogSummaryPrompt,
  imagePrompt,
  introPrompt,
} from "$lib/utils/prompts";
import { onMount } from "svelte";

// Initialize states and reactive variables
let isLoading = {
  content: false,
  title: false,
  tags: false,
  summary: false,
  image: false,
};
let formSubmitted = false;
let loadingMessage = "";
let currentStep = 0;
let chatGptInts: any[] = [];
let originalPrompt = "";
let base64Image;
let curTags = "";
let isAuthenticated = false;

interface Tag {
  id: string;
  title: string;
}

interface Post {
  title: string;
  slug: string;
  body: string;
  tags: string[];
  blogSummary: string;
  featuredImage: string;
  userid: string;
  prompt: string;
}

$: post = {
  title: "",
  slug: "",
  body: "",
  tags: [] as string[],
  blogSummary: "",
  featuredImage: "",
  userid: $authModel?.id || "",
  prompt: "",
};

$: chatGptPrompt = "";

const engineId = "stable-diffusion-v1-6";
const apiHost = "https://api.stability.ai";
const apiKey = import.meta.env.VITE_STABILITY_API_KEY;

if (!apiKey) {
  console.error("Missing Stability API key.");
  throw new Error("Missing Stability API key.");
}

onMount(async () => {
  isAuthenticated = !!authModel;
});

async function ensureTagsExist(tags: string[]): Promise<Tag[]> {
  const tagObjects: Tag[] = [];
  for (const title of tags) {
    const filterExpression = `title = "${title.replace(/"/g, '\\"')}"`;
    const existingTags = await client
      .collection("tags")
      .getList(1, 1, { filter: filterExpression });

    let existingTag =
      existingTags.items.length > 0 ? existingTags.items[0] : null;

    if (!existingTag) {
      existingTag = await client.collection("tags").create({ title });
    }

    if (existingTag) {
      tagObjects.push({ id: existingTag.id, title: existingTag.title });
    } else {
      throw new Error("Failed to create or retrieve tag");
    }
  }
  return tagObjects;
}

async function uploadImageAndSavePost(
  base64Image: string,
  curTags: string
): Promise<void> {
  try {
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

    // Prepare post data
    post.userid = $authModel?.id || "";

    // Upload image and create image record
    const createdImageRecord = await client
      .collection("images")
      .create(formData);

    post.featuredImage = createdImageRecord.id;

    // Process tags
    const tagsArray = curTags
      .split(",")
      .map((tag) => tag.trim())
      .filter((tag) => tag);

    // Ensure tags exist in the `tags` collection and get their IDs
    const tagObjects = await ensureTagsExist(tagsArray);

    // Prepare post data
    const postToCreate = {
      title: post.title,
      slug: post.slug,
      body: post.body,
      blogSummary: post.blogSummary,
      featuredImage: createdImageRecord.id,
      userid: $authModel?.id || "",
      prompt: post.prompt,
    };

    // Create post record
    const createdPost = await save("posts", postToCreate, true);

    // Link tags to the post by creating records in the postsTags table
    for (const tagObject of tagObjects) {
      await client.collection("postsTags").create({
        posts: createdPost.id,
        tags: tagObject.id,
      });
    }

    // Redirect to the new post
    goto(`${import.meta.env.VITE_APP_SK_URL}/posts/${post.slug}`);
  } catch (error) {
    console.error(`Failed to upload image and save post: ${error}`);
    alertOnFailure(`Failed to upload image and save post: ${error}`);
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
    const interpretationsResponse = await generateGptRequest(
      introPrompt + promptString
    );

    originalPrompt = promptString;

    chatGptInts = parseInterpretations(interpretationsResponse);

    formSubmitted = true;
  } catch (error) {
    alertOnFailure(error);
  }
}

function parseInterpretations(response: string): any[] {
  const rawInterpretations = response.split("\n");
  const interpretations: any[] = [];

  rawInterpretations.forEach((interpretation: string) => {
    const parts = interpretation.split(": ");

    if (parts.length === 2) {
      const [perspectiveName, content] = parts;
      const trimmedPerspectiveName = perspectiveName.trim();
      const trimmedContent = content.trim();

      interpretations.push({
        perspectiveName: trimmedPerspectiveName,
        content: trimmedContent,
      });
    }
  });

  return interpretations;
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
    let bodyResponse = await generateGptRequest(
      `${promptFormat}This is the user's inspiration: '${userPrompt}'`
    );
    post.body = bodyResponse;
    updateProgressBar(10);
    isLoading.content = false;

    isLoading.title = true;
    loadingMessage = "Generating post title...";
    const titleResponse = await generateGptRequest(
      `${titlePrompt}This is the user's article: '${bodyResponse}'`
    );
    post.title = titleResponse.replace(/["']/g, "");
    updateProgressBar(20);
    isLoading.title = false;

    post.slug = titleResponse
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/["':]/g, "")
      .substring(0, 50);
    post.prompt = userPrompt;

    loadingMessage = "Generating post tags...";
    curTags = await generateGptRequest(
      `${tagPrompt}This is the blog article: '${bodyResponse}'`
    );

    updateProgressBar(30);

    isLoading.summary = true;
    loadingMessage = "Generating post summary...";
    const blogSummaryResponse = await generateGptRequest(
      `${blogSummaryPrompt}This is the blog article: '${bodyResponse}'`
    );
    post.blogSummary = blogSummaryResponse;
    updateProgressBar(40);
    isLoading.summary = false;

    isLoading.image = true;
    loadingMessage = "Generating post image...";
    const base64Image = await generateImageFromSD(userPrompt);
    updateProgressBar(60);
    isLoading.image = false;

    loadingMessage = "Saving post...";
    await uploadImageAndSavePost(base64Image, curTags);
  } catch (error) {
    alertOnFailure(error);
    isLoading.content = false;
    isLoading.title = false;
    isLoading.tags = false;
    isLoading.summary = false;
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

async function generateGptRequest(prompt: string) {
  const response = await fetch("/api/chatgpt", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt }),
  });
  if (!response.ok) throw new Error("Failed to generate text from ChatGPT");
  const data = await response.json();
  return data.result;
}

async function generateImageFromSD(prompt: string): Promise<string> {
  isLoading.image = true;
  try {
    const response = await fetch(
      `${apiHost}/v1/generation/${engineId}/text-to-image`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          text_prompts: [{ text: prompt }],
          cfg_scale: 7,
          height: 512,
          width: 512,
          steps: 30,
          samples: 1,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Non-200 response: ${await response.text()}`);
    }

    const responseJSON = await response.json();
    const imageBase64 = responseJSON.artifacts[0].base64;

    return imageBase64;
  } catch (error) {
    console.error("Error generating image:", error);
    throw error;
  } finally {
    isLoading.image = false;
  }
}

function alertOnFailure(error: any) {
  console.error("Error:", error);
  alert(error instanceof Error ? error.message : "An unknown error occurred");
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
}
</script>

<div>
  {#if isLoading.content || isLoading.title || isLoading.tags || isLoading.summary || isLoading.image}
    <div class="mt-12 flex flex-col items-center space-y-4">
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
        <div class="mt-4">
          {@html marked(post.body || "")}
        </div>
      </div>
      <div class="mt-4">
        <h2 class="text-2xl font-bold">{post.title}</h2>
      </div>
      <div class="mt-4">
        <p>{post.slug}</p>
      </div>
      <div class="mt-4">
        <div class="mb-4 flex flex-wrap gap-2">Tags</div>
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
        {#if chatGptInts.length > 0}
          <div class="mb-4 text-xl font-semibold">
            Select an interpretation:
          </div>
          <div class="flex flex-wrap gap-2">
            {#each chatGptInts as interpretation}
              <button
                class="btn btn-outline"
                on:click={() => selectInterpretation(interpretation.content)}
                >{interpretation.content}</button
              >
            {/each}
          </div>
        {/if}
        <button class="btn btn-secondary mt-6" on:click={goBack}>Back</button>
      </section>
    </main>
  {/if}
</div>
