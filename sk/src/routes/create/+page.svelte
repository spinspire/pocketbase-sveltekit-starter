<script lang="ts">
import { goto } from "$app/navigation";
import { authModel, client, save } from "$lib/pocketbase";
import type { PageData } from "./$types";
import { apiRequest } from "$lib/utils/api"; // Adjust the path as necessary
import { marked } from "marked";
import {
  promptFormat,
  titlePrompt,
  tagPrompt,
  blogSummaryPrompt,
  imagePrompt,
} from "$lib/utils/prompts";
import PocketBase from "pocketbase";
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

$: post = {
  title: "",
  slug: "",
  body: "",
  tags: [] as string[],
  blogSummary: "",
  featuredImage: "",
  user: $authModel?.id || "",
  interpretations: [] as any[],
};

$: chatGptPrompt = "";

// Assuming you have the API key stored in an environment variable
const engineId = "stable-diffusion-v1-6";
const apiHost = "https://api.stability.ai";
const apiKey = import.meta.env.VITE_STABILITY_API_KEY;

if (!apiKey) throw new Error("Missing Stability API key.");

onMount(async () => {
  try {
    if (!$authModel) {
      console.error("User is not authenticated.");
      isAuthenticated = false;
      return;
    }
    else
    {
      isAuthenticated = true;
    }
  } catch (error) {
    console.error("Error checking user authentication:", error);
    isAuthenticated = false;
  }
});


async function ensureTagsExist(tags: string[]): Promise<string[]> {
  const tagIds = [];
  console.log("Ensuring tags exist:", tags);
  for (const title of tags) {
    try {
      // Use a filter expression to search for the tag by title
      const filterExpression = `title = "${title.replace(/"/g, '\\"')}"`; // Escape double quotes in title
      console.log("Checking for tag:", title);

      // Attempt to find the tag by its title
      const existingTags = await client.collection('tags').getList(1, 1, { filter: filterExpression });

      let existingTag = existingTags.items.length > 0 ? existingTags.items[0] : null;

      // If the tag doesn't exist, create it
      if (!existingTag) {
        console.log("Tag does not exist, creating new tag:", title);
        existingTag = await client.collection('tags').create({ title });
        console.log("Created new tag:", existingTag);
      } else {
        console.log("Found existing tag:", existingTag);
      }

      // Store the tag's ID
      if (existingTag)
        tagIds.push(existingTag.id);
      else
        throw new Error("Failed to create tag");
    } catch (error) {
      console.error("Error handling tag:", title, error);
      throw error; // Optionally rethrow the error or handle it as needed
    }
  }
  return tagIds;
}


// Link tags to the created post
async function linkTagsToPost(tagIds: string[], postId: string) {
  for (const tagId of tagIds) {
    // For each tag, create a record in the 'postsTags' collection linking it to the post
    await client.collection("postsTags").create({
      post: postId, // Assuming 'post' is the correct field name in 'postsTags' for linking to the post ID
      tag: tagId, // Adjust field names as necessary based on your 'postsTags' collection schema
    });
  }
}

// Assuming `pb` is your PocketBase client instance and authentication is set up correctly
async function uploadImageAndSavePost(
  base64Image: string,
  curTags: string = ""
): Promise<void> {
  try {
    // Convert base64 image to Blob
    const imageBlob = await fetch(`data:image/png;base64,${base64Image}`).then(
      (res) => res.blob()
    );
    if (imageBlob.size > 5242880) {
      // 5MB
      throw new Error("Image size exceeds the maximum limit of 5MB.");
    }
    const formData = new FormData();
    formData.append("file", imageBlob, "postImage.png");
    console.log("Uploading image to PocketBase...");

    // Upload the image to the 'images' collection
    const createdImageRecord = await client.collection("images").create(formData);
    console.log("Image uploaded successfully", createdImageRecord);
    // Ensure curTags is not undefined before splitting, default to an empty string if undefined
    const tagsArray = (curTags || "")
      .split(",")
      .map((tag) => tag.trim())
      .filter((tag) => tag);
    console.log("Tags array:", tagsArray);
    // Continue with tag existence check, image upload, and post creation...
    const tagIds = await ensureTagsExist(tagsArray);
    console.log("Tag IDs:", tagIds);
    // Assuming post object setup is done before this and includes necessary post fields
    post.featuredImage = createdImageRecord.id;
    console.log("Post object with image:", post);
    // Save the post and link tags as before
    // Ensure save and linkTagsToPost functions are correctly implemented
    const createdPost = await save("posts", post, true);
    console.log("Post saved successfully", createdPost);
    await linkTagsToPost(tagIds, createdPost.id);
    console.log("Post saved successfully with tags and image", createdPost);
    goto(`${import.meta.env.VITE_APP_SK_URL}/posts/${post.slug}`);
  } catch (error) {
    console.error(`Failed to upload image and save post: ${error}`);
    alertOnFailure(`Failed to upload image and save post: ${error}`);
  }
}

async function saveImage(post: { featuredImage: string }) {
  try {
    console.log("Uploading image...");
    const imageResponse = await fetch(post.featuredImage);
    if (!imageResponse.ok) {
      console.log(
        "Failed to fetch image from temporary URL:",
        post.featuredImage
      );
      throw new Error(
        `Failed to fetch image from temporary URL: ${post.featuredImage}`
      );
    }
    console.log("Image fetched successfully");
    const imageBlob = await imageResponse.blob();

    // Prepare the form data for uploading
    const formData = new FormData();
    formData.append("file", imageBlob, "postImage.png"); // Adjust the field name according to your PocketBase collection schema

    console.log("Uploading image to PocketBase...");

    // Upload and create new record in PocketBase
    const createdRecord = await client.collection("yourCollectionName").create({
      // Assuming "file" is the field name in your PocketBase collection for the image
      // and other fields as necessary.
      file: formData.get("file"),
      title: "Image Title", // Example, replace with actual data if needed
    });

    console.log("Image uploaded successfully", createdRecord);
  } catch (error) {
    console.error("Error uploading image to PocketBase:", error);
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

// Updated generateImageFromSD to handle backend response change
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
          text_prompts: [
            {
              text: prompt,
            },
          ],
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

    // Assuming you want to use the first image artifact
    const imageBase64 = responseJSON.artifacts[0].base64;

    isLoading.image = false;
    // Return the base64 image data
    return imageBase64;
  } catch (error) {
    console.error("Error generating image:", error);
    throw error; // Propagate error for further handling
  } finally {
    isLoading.image = false;
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
      `Be creative, be fun, be unique.  You are a thinker and an idea genrator.  People give you a phrase or a thought, and you rephrase that into 5 different ideas, one from each of the listed five perspectives:
      
        { view: "Optimistic", description: "Always sees the glass as half full and believes in the best possible outcome." },
        { view: "Pessimistic", description: "Tends to see the downside in every situation and prepares for the worst." },
        { view: "Realistic", description: "Looks at the facts and figures to make practical and logical decisions." },
        { view: "Creative", description: "Thinks outside the box and approaches problems with a fresh perspective." },
        { view: "Analytical", description: "Breaks down problems into smaller parts to understand the underlying issues." }
      

      
      Respond to the user by providing  five seperate prompts based on if the person who had the idea also had that type of perspective.  Generate 5 alternative prompts that further explain the concept in a different viewpoint by each of the perspectives.
      
      Return 5 sentences, # - hashtag, make sure to separate each complete idea by a '#' - just sthe symbol # - only use # to seperate the sentences, do not use in the ideas - start each sentence with the name of the view person: - this is the prompt - remember this will be parsed according to these rules: '${promptString}'`
    );

    originalPrompt = promptString;

    console.log(interpretationsResponse);

    // Assign the array of interpretations directly to `post.interpretations`
    chatGptInts = parseInterpretations(interpretationsResponse);

    console.log(chatGptInts);
    formSubmitted = true;
  } catch (error) {
    alertOnFailure(error);
  } finally {
  }
}

function parseInterpretations(response: string) {
  // Split the response by the '#' symbol to separate each sentence
  const rawInterpretations = response.split("#");

  // Map each raw interpretation to a trimmed and processed version
  const interpretationsArray = rawInterpretations.map(
    (interpretation: string) => {
      // Trim leading and trailing whitespace from each interpretation
      const trimmedInterpretation = interpretation.trim();

      // Further processing can be added here if needed, e.g., parsing each sentence's structure
      // Since the prompt mentions starting each sentence with the name of the view person and other rules,
      // any additional parsing based on these rules would be implemented here.

      return trimmedInterpretation;
    }
  );

  return interpretationsArray;
}

export async function generateBlogFromChatGPT(userPrompt: string) {
  if (!$authModel?.id) {
    alert("Please log in to save your post.");
    return;
  }

  //resetLoadingStates();
  currentStep = 0; // Reset the step at the start

  try {
    // Generate the main content of the post using ChatGPT
    isLoading.content = true;
    loadingMessage = "Generating post content...";
    let bodyResponse = await generateGptRequest(
      `${promptFormat}This is the user's inspiration: '${userPrompt}'`
    );
    if (bodyResponse === null) {
      throw new Error("Failed to generate body response");
    }

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

    // Generate a slug for the URL
    isLoading.tags = true;
    loadingMessage = "Generating post slug...";
    post.slug = titleResponse
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/["':]/g, "")
      .substring(0, 50);

    // Generate tags for the post
    loadingMessage = "Generating post tags...";
    curTags = await generateGptRequest(
      `${tagPrompt}This is the blog article: '${bodyResponse}'`
    );
    //post.tags = tagsResponse; // Assuming the tagsResponse is a comma-separated string
    updateProgressBar(30);
    isLoading.tags = false;

    // Generate a summary for the blog post
    isLoading.summary = true;
    loadingMessage = "Generating post summary...";
    const blogSummaryResponse = await generateGptRequest(
      `${blogSummaryPrompt}This is the blog article: '${bodyResponse}'`
    );
    post.blogSummary = blogSummaryResponse;
    updateProgressBar(40);
    isLoading.summary = false;

    isLoading.image = true;
    loadingMessage = "Generating post image prompt...";
    const imagePromptText = await generateGptRequest(
      `${imagePrompt}This is the blog article summary: '${blogSummaryResponse}'`
    );
    updateProgressBar(50);

    // Generate the image and get the base64 data
    loadingMessage = "Generating post image...";
    const base64Image = await generateImageFromSD(imagePromptText);
    updateProgressBar(60);
    isLoading.image = false;

    // Save the post with the image
    loadingMessage = "Saving post...";
    await uploadImageAndSavePost(base64Image, curTags);
  } catch (error) {
    alertOnFailure(error);
    // Reset all loading states in case of an error
    isLoading.content = false;
    isLoading.title = false;
    isLoading.tags = false;
    isLoading.summary = false;
    isLoading.image = false;

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
  chatGptPrompt = originalPrompt + " - " + interpretation;

  console.log("Captured the final prompt: " + chatGptPrompt);

  // Start loading here
  isLoading.content = true; // Assuming this is the first step in generating the blog
  loadingMessage = "Generating blog...";
  generateBlogFromChatGPT(chatGptPrompt)
    .then(() => {
      isLoading.content = false; // Reset or update loading states as necessary when done
    })
    .catch((error) => {
      alertOnFailure(error); // Handle errors
      isLoading.content = false; // Ensure loading state is reset on error
    });
}
</script>

<div>
  {#if isLoading.content || isLoading.title || isLoading.tags || isLoading.summary || isLoading.image}
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
        <div class="mb-4 flex flex-wrap gap-2">
          Tags
          <!-- {#if post.tags && post.tags.length}
            {#if typeof post.tags === 'string'}
              {#each post.tags.split(',') as tag}
                <a href="/" class="badge badge-outline badge-accent"
                  >{tag.trim()}</a
                >
              {/each}
            {/if}
          {/if} -->
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
        {#if chatGptInts.length > 0}
          <div class="mb-4 text-xl font-semibold">
            Select an interpretation:
          </div>
          <div class="flex flex-wrap gap-2">
            {#each chatGptInts as interpretation}
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
