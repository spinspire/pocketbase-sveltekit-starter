<script lang="ts">
import { metadata } from "$lib/app/stores";
import { goto } from "$app/navigation";
import { authModel, save } from "$lib/pocketbase";
import { alertOnFailure } from "$lib/pocketbase/ui";
import type { PageData } from "./$types";
import Markdown from "svelte-markdown";
// Import the prompts
import {
  promptFormat,
  titlePrompt,
  tagPrompt,
  blogSummaryPrompt,
} from "$lib/utils/prompts";

$: test = "";
$metadata.title = "";
$metadata.description = "AI powered note taking";

$: post = {
  title: "",
  slug: "",
  body: "",
  tags: [],
  blogSummary: "",
  featuredImage: "",
  user: "",
};
//$: $metadata.title = post.title;
//$: $metadata.description = "";

let chatGptPrompt: string = "";
let chatGptResponse: string = "";
let chatGptTitle: string = ""; // Variable for title
let chatGptSlug: string = ""; // Variable for slug
let chatGptTags: string = ""; // Variable for tags

async function saveBlog() {
  console.log("Submitting post:", post);
  if (!$authModel || typeof $authModel.id === "undefined") {
    alert("Please log in to save your post.");
    return;
  }

  post.user = $authModel.id;

  // Proceed with saving the post
  try {
    console.log("Saving post:", post);
    await save("posts", post);
    console.log("Post saved:", post);
    goto("http://localhost:5173/posts/" + post.slug);
  } catch (error) {
    alert("Failed to save post. Please try again.");
  }
}

async function generateImageFromDalle(prompt: string) {
  try {
    const response = await fetch("/api/dalle", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt }),
    });
    if (!response.ok) throw new Error("Failed to generate image from Dalle-3");
    const data = await response.json(); // Parse the JSON response
    post.featuredImage = data.url; // Use the URL returned from the server
    console.log("Featured Image URL:", post.featuredImage);
  } catch (error) {
    console.error("Error:", error);
    alert(error instanceof Error ? error.message : "An unknown error occurred");
  }
}

// Export the generateFromChatGPT function
export async function generateFromChatGPT(userPrompt: string) {
  chatGptPrompt = userPrompt;

  console.log("Submitting post:", post);
  if (!$authModel || $authModel.id === undefined) {
    alert("Please log in to save your post.");
    return;
  }

  // Generate body
  const bodyResponse = await generateGptRequest(
    promptFormat + "This is the user's inspiration: '" + chatGptPrompt + "'"
  );

  post.body = bodyResponse;

  // Generate title
  const titleResponse = await generateGptRequest(
    titlePrompt + "This is the user's article: '" + bodyResponse + "'"
  );
  post.title = titleResponse.replace(/["']/g, "");

  post.slug = titleResponse
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/["':]/g, "")
    .substring(0, 50);

  // Generate tags
  const tagsResponse = await generateGptRequest(
    tagPrompt + "This is the blog article: '" + bodyResponse + "'"
  );

  post.tags = tagsResponse;

  const blogSummaryResponse = await generateGptRequest(
    blogSummaryPrompt + "This is the blog article: '" + bodyResponse + "'"
  );

  post.blogSummary = blogSummaryResponse;

  // Generate image from Dalle
  const imageResponse = await generateImageFromDalle(
    titleResponse + "  " + tagsResponse
  );

  saveBlog();

  return {
    title: post.title,
    slug: post.slug,
    body: post.body,
    blogSummary: post.blogSummary,
    tags: post.tags,
    featuredImage: post.featuredImage,
    // ... any other fields you need
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
  return data.result; // Assuming the response has a 'result' field
}
</script>

<div>
  <main class="container mx-auto my-12 px-4 sm:px-6 lg:px-8">
    <div class="">
      <!-- Form and GPT Prompt -->
      <section class="space-y-6">
        <div class="bg-base-200 p-6">
          <div class="w-full">
            <textarea
              id="body"
              name="body"
              bind:value={chatGptPrompt}
              rows="10"
              class="textarea textarea-bordered w-full resize-none"
              placeholder="enter thoughts here"
            ></textarea>
          </div>
          <div class="text-right">
            <button
              class="btn btn-primary mt-4"
              on:click={() => generateFromChatGPT(chatGptPrompt)}
            >
              done
            </button>
          </div>
        </div>
      </section>

      <!-- <a href="new/edit">hello</a>
          <aside class="space-y-6">
            <div class="bg-base-200 p-6">
              <h2 class="text-lg font-semibold">GPT-3 Prompt</h2>
              <p class="text-sm text-base-content">
                This is a prompt for GPT-3. It will generate a response based on the input you provide.
                {test}
              </p>
            </div>
          </aside> -->
    </div>
  </main>
</div>
