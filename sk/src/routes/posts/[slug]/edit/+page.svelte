<script lang="ts">
  import { goto } from "$app/navigation";
  import { authModel, save } from "$lib/pocketbase";
  import { alertOnFailure } from "$lib/pocketbase/ui";
  import type { PageData } from "./$types";

  export let data: PageData;
  $: ({ post } = data);

  let selectedFiles: FileList | null = null;
  let chatGptPrompt = "";
  let chatGptResponse = "";
  let chatGptTitle = ""; // New variable for title
  let chatGptSlug = ""; // New variable for slug
  let chatGptTags = ""; // New variable for tags

  async function submit(e: SubmitEvent) {
    post.user = $authModel?.id;
    if (
      post.title.includes('"') ||
      post.title.includes("'") ||
      post.slug.includes('"') ||
      post.slug.includes("'")
    ) {
      alert(
        "Title and slug cannot contain double quotes (\") or single quotes (')."
      );
      return; // Stop the submission process
    }

    alertOnFailure(async () => {
      await save("posts", post);
      goto("../..");
    });
  }

  function handleFilesChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      const selectedFiles = input.files;
      // If you need to convert FileList to an array for other uses, do it here
      // For example, to store file names: fileNames = Array.from(selectedFiles).map(file => file.name);
    }
  }

  async function generateImageFromDalle(prompt: string) {
    const response = await fetch("/api/dalle", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ prompt: "Generate an image to represent an article on this topic: " + prompt }),
    });

    if (!response.ok) {
      throw new Error("Failed to generate image from Dalle-3");
    }

    const { imageUrl } = await response.json();
    post.featuredImage = imageUrl; // Update post with the new featured image URL
  }

  // When submitting, ensure you handle `selectedFiles` appropriately, e.g., uploading them

  async function generateTextFromChatGPT() {
  // Parallelize operations
  const [imageResponse, titleResponse, tagsResponse, bodyResponse] = await Promise.all([
    generateImageFromDalle(chatGptPrompt),
    generateGptRequest(
      "Generate a title for a blog post about " + chatGptPrompt + ".  Do not include single or double parentheses.  Make the title less than 50 characters."
    ),
    generateGptRequest(
      "Generate tags for a blog post titled '" + chatGptTitle + "'" + ".  Separate tags with commas. The tags should be less than 20 characters, and there should be less than 5 tags."
    ),
    generateGptRequest(
      "This is the user's inspiration: " + chatGptPrompt + ".  The post should be at least 300 words.  This should be a stream of consciousness type response.  Do not include single or double parentheses. It should try to capture the idea and concept of the prompt.  It should be written in a conversational tone.  It should be written in the first person.  It should be written in the present tense.  It should be written in the active"
    ),
  ]);

  // Process title response
  post.title = titleResponse.replace(/["']/g, "");;

  // Generate slug from title
  post.slug = titleResponse.toLowerCase().replace(/\s+/g, "-").replace(/["':]/g, "").substring(0, 50);

  // Process tags response
  post.tags = tagsResponse;

  post.body = bodyResponse;
}

  async function generateGptRequest(prompt: string) {
    const response = await fetch("/api/chatgpt", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ prompt }),
    });
    if (!response.ok) {
      throw new Error("Failed to generate text from ChatGPT");
    }
    const data = await response.json();
    return data.result; // Assuming the response has a 'result' field
  }
</script>

<!-- In your Svelte component -->
<style>
  form, div {
    display: flex;
    flex-direction: column;
    gap: 15px;
    margin-bottom: 20px;
  }

  input, textarea, button {
    padding: 10px;
    border-radius: 5px;
    border: 1px solid #ccc;
    font-family: 'Arial', sans-serif;
  }

  input:focus, textarea:focus {
    outline: none;
    border-color: #007bff;
    box-shadow: 0 0 0 0.2rem rgba(0,123,255,.25);
  }

  button {
    background-color: #007bff;
    color: white;
    border: none;
    cursor: pointer;
    transition: background-color 0.3s ease;
  }

  button:hover {
    background-color: #0056b3;
  }

  img {
    max-width: 100%;
    height: auto;
    border-radius: 5px;
  }

  input[type="file"] {
    background: none;
    border: 1px dashed #ccc;
  }

  /* Adjustments for mobile screens */
  @media (max-width: 600px) {
    form, div {
      width: 90%;
      margin: 0 auto;
    }
  }
</style>

<form on:submit|preventDefault={submit}>
  {#if post.featuredImage}
    <img src={post.featuredImage} style="size: 400px" alt="Featured AI Pic" />
  {/if}
  <input name="title" bind:value={post.title} placeholder="Title" />
  <input name="slug" bind:value={post.slug} placeholder="Slug" />
  <textarea name="body" bind:value={post.body} placeholder="Body" rows="10"></textarea>
  <input type="file" on:change={handleFilesChange} multiple />
  <input name="tags" bind:value={post.tags} placeholder="Tags" />
  <button type="submit">Submit</button>
</form>

<div>
  <textarea
    placeholder="Enter ChatGPT Prompt"
    bind:value={chatGptPrompt}
    rows="3"
  ></textarea>
  <button type="button" on:click={generateTextFromChatGPT}>Generate with ChatGPT</button>
</div>

