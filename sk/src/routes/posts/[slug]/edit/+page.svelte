<script lang="ts">
  import { goto } from "$app/navigation";
  import { authModel, save } from "$lib/pocketbase";
  import { alertOnFailure } from "$lib/pocketbase/ui";
  import type { PageData } from "./$types";

  export let data: PageData;
  $: ({ post } = data);

  let chatGptPrompt: string = "";
  let chatGptResponse: string = "";
  let chatGptTitle: string = ""; // Variable for title
  let chatGptSlug: string = ""; // Variable for slug
  let chatGptTags: string = ""; // Variable for tags

  async function submit(e: SubmitEvent) {
    e.preventDefault();
    post.user = $authModel?.id;

    // Proceed with saving the post
    try {
      await save("posts", post);
      goto("../..");
    } catch (error) {
      alert("Failed to save post. Please try again.");
    }
  }

  async function generateImageFromDalle(prompt) {
  try {
    const response = await fetch("/api/dalle", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt }),
    });
    if (!response.ok)
      throw new Error("Failed to generate image from Dalle-3");
    const data = await response.json(); // Parse the JSON response
    post.featuredImage = data.url; // Use the URL returned from the server
    console.log("Featured Image URL:", post.featuredImage);
  } catch (error) {
    console.error("Error:", error);
    alert(
      error instanceof Error ? error.message : "An unknown error occurred"
    );
  }
}


  async function generateFromChatGPT() {
    // Parallelize operations
    const [imageResponse, titleResponse, tagsResponse, bodyResponse] =
      await Promise.all([
        generateImageFromDalle(chatGptPrompt),
        generateGptRequest(
          "Generate a title for a blog post about " + chatGptPrompt
        ),
        generateGptRequest(
          "Generate tags for a blog post titled '" + chatGptTitle + "'"
        ),
        generateGptRequest("This is the user's inspiration: " + chatGptPrompt),
      ]);

    // Process title, tags, and body responses
    post.title = titleResponse.replace(/["']/g, "");
    post.slug = titleResponse
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/["':]/g, "")
      .substring(0, 50);
    post.tags = tagsResponse;
    post.body = bodyResponse;
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

{#if post.featuredImage}
  <img src={post.featuredImage} alt="Featured Pic" />
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
  <img src={`http://localhost:8090/dalle_image_1708071009.png`} alt="Featured Pic" />
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
