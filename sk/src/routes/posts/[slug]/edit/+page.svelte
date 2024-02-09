<script lang="ts">
  import { goto } from "$app/navigation";
  import { authModel, save } from "$lib/pocketbase";
  import { alertOnFailure } from "$lib/pocketbase/ui";
  import type { PageData } from "./$types";

  export let data: PageData;
  $: ({ post } = data);

  let chatGptPrompt = "";
  let chatGptResponse = "";
  let selectedFiles: FileList | null = null;

  async function submit(e: SubmitEvent) {
    post.user = $authModel?.id;
    alertOnFailure(async () => {
      await save("posts", post);
      goto("../..");
    });
  }

  function handleFilesChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      selectedFiles = input.files;
      // If you need to convert FileList to an array for other uses, do it here
      // For example, to store file names: fileNames = Array.from(selectedFiles).map(file => file.name);
    }
  }

  // When submitting, ensure you handle `selectedFiles` appropriately, e.g., uploading them

  async function generateTextFromChatGPT() {
    console.log("Generating text from ChatGPT with prompt:", chatGptPrompt); // Debug output 1
    try {
      const response = await fetch("/api/chatgpt", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt: chatGptPrompt }),
      });

      console.log("Response received:", response); // Debug output 2

      if (!response.ok) {
        console.error(
          "Failed to generate text from ChatGPT:",
          response.status,
          response.statusText
        );
        alert("Failed to generate text from ChatGPT");
        return;
      }

      const data = await response.json();
      console.log("Data received from ChatGPT:", data); // Debug output 3
      chatGptResponse = data.result; // Assuming the response has a 'result' field with the ChatGPT response
    post.body = chatGptResponse;
    
    } catch (error) {
      console.error("Fetch error:", error);
      alert("An error occurred while generating text from ChatGPT.");
    }
  }
</script>

<form on:submit|preventDefault={submit}>
  <input name="title" bind:value={post.title} placeholder="title" />
  <input name="slug" bind:value={post.slug} placeholder="slug" />
  <textarea name="body" bind:value={post.body} placeholder="body" rows="10" />
  <input type="file" on:change={handleFilesChange} multiple />
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
