<script lang="ts">
  import { goto } from "$app/navigation";
  import { authModel, save } from "$lib/pocketbase";
  import { alertOnFailure } from "$lib/pocketbase/ui";
  import type { PageData } from "./$types";

  export let data: PageData;
  $: ({ post } = data);

  let selectedFiles: File[] = [];
  let chatGptPrompt: string = '';
  let chatGptResponse: string = '';
  let chatGptTitle: string = ''; // New variable for title
  let chatGptSlug: string = ''; // New variable for slug
  let chatGptTags: string = ''; // New variable for tags

  let featuredImageUrl: string = '';

  function isValidHttpUrl(input: string): boolean {
    try {
      const url = new URL(input);
      return url.protocol === 'http:' || url.protocol === 'https:';
    } catch (_) {
      return false;
    }
  }

  async function imageUrlToFile(imageUrl: string, filename: string): Promise<File> {
    const response = await fetch(imageUrl);
    if (!response.ok) throw new Error('Image fetch failed');
    const blob = await response.blob();
    return new File([blob], filename, { type: blob.type });
  }

  async function submit(e: SubmitEvent) {
    e.preventDefault();
    post.user = $authModel?.id;

    if (featuredImageUrl && isValidHttpUrl(featuredImageUrl)) {
      try {
        const imageFile = await imageUrlToFile(featuredImageUrl, "featured.jpg");
        post.featuredImage = imageFile;
      } catch (error) {
        alert('Failed to process featured image. Please try again.');
        return;
      }
    } else {
      alert('Featured image URL is not valid.');
      return;
    }

    try {
      await save('posts', { ...post });
      goto('../..');
    } catch (error) {
      alert('Failed to save post. Please try again.');
    }
  }


  function handleFilesChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      selectedFiles = Array.from(input.files);
    }
  }

  // Function to generate image URL from Dalle and set it as featuredImageUrl
  async function generateImageFromDalle(prompt: string) {
    try {
      const response = await fetch('/api/dalle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });
      if (!response.ok) throw new Error('Failed to generate image from Dalle-3');
      const { imageUrl } = await response.json();
      if (!isValidHttpUrl(imageUrl)) throw new Error('Invalid URL for featured image');
      featuredImageUrl = imageUrl; // Set the image URL
    } catch (error) {
      alert((error instanceof Error) ? error.message : 'An unknown error occurred');
    }
  }

  
  async function generateFromChatGPT() {
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

// Assume generateGptRequest is implemented to make API requests and handle responses appropriately


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


{#if featuredImageUrl}
  <div class="featured-image">
    <img src={featuredImageUrl} alt="Featured Pic" />
  </div>
{/if}

<form on:submit|preventDefault={submit}>
  <label for="title">Title</label>
  <input id="title" name="title" bind:value={post.title} placeholder="Title" />

  <label for="slug">Slug</label>
  <input id="slug" name="slug" bind:value={post.slug} placeholder="Slug" />

  <label for="body">Body</label>
  <textarea
    id="body"
    name="body"
    bind:value={post.body}
    placeholder="Body"
    rows="10"
  ></textarea>

  <!-- <label for="files">Upload Files</label>
  <input id="files" type="file" on:change={handleFilesChange} multiple />
 -->
  <label for="tags">Tags</label>
  <input id="tags" name="tags" bind:value={post.tags} placeholder="Tags" />

  <button type="submit">Submit</button>
</form>

<div>
  <textarea
    placeholder="Enter ChatGPT Prompt"
    bind:value={chatGptPrompt}
    rows="3"
  ></textarea>
  <button type="button" on:click={generateFromChatGPT}
    >Generate with ChatGPT</button
  >
</div>

<style>
  form,
  div {
    display: flex;
    flex-direction: column;
    gap: 15px;
    margin-bottom: 20px;
  }

  input,
  textarea,
  button {
    padding: 10px;
    border-radius: 5px;
    border: 1px solid #ccc;
    font-family: "Arial", sans-serif;
  }

  input:focus,
  textarea:focus {
    outline: none;
    border-color: #007bff;
    box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
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

  @media (max-width: 600px) {
    form,
    div {
      width: 90%;
      margin: 0 auto;
    }
  }
</style>
