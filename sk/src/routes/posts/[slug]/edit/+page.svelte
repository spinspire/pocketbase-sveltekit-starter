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

  // When submitting, ensure you handle `selectedFiles` appropriately, e.g., uploading them

  async function generateTextFromChatGPT() {
    // Generate title
    chatGptTitle = await generateGptRequest(
      "Generate a title for a blog post about " + chatGptPrompt
    );
    post.title = chatGptTitle; // Update post title

    // Generate slug from title
    chatGptSlug = chatGptTitle
      .toLowerCase()
      .replace(/\s+/g, "-")
      .substring(0, 50);
    post.slug = chatGptSlug; // Update post slug

    // Generate tags
    chatGptTags = await generateGptRequest(
      "Generate tags for a blog post titled '" + chatGptTitle + "'"
    );
    post.tags = chatGptTags.split(",").map((tag) => tag.trim()); // Assuming post has a 'tags' field to update and tags are separated by commas

    // Generate body
    chatGptResponse = await generateGptRequest(chatGptPrompt);
    post.body = chatGptResponse; // Update post body
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

<form on:submit|preventDefault={submit}>
  <input name="title" bind:value={post.title} placeholder="title" />
  <input name="slug" bind:value={post.slug} placeholder="slug" />
  <textarea name="body" bind:value={post.body} placeholder="body" rows="10" />
  <input type="file" on:change={handleFilesChange} multiple />
  <input name="tags" bind:value={post.tags} placeholder="tags" />
  <button type="submit">Submit</button>
</form>

<div>
  <textarea
    placeholder="Enter ChatGPT Prompt"
    bind:value={chatGptPrompt}
    rows="3"
  ></textarea>
  <button type="button" on:click={generateTextFromChatGPT}
    >Generate with ChatGPT</button
  >
</div>
