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

  let promptFormat = `Title: Idea Exploration and Brain Mapping

Description: This prompt is designed to take a single phrase, idea, or concept input and deeply explore it across various dimensions. It aims to generate a rich, interconnected map of thoughts, questions, possibilities, and related topics to serve as a creative or analytical reference.

Input Instructions:
- Clearly state the phrase, idea, or concept you wish to explore.
- Provide any specific context or constraints you want the exploration to adhere to, such as a particular field of interest (e.g., technology, philosophy, art), purpose (e.g., innovation, problem-solving, education), or any specific questions you're looking to answer.

Output Specifications:
1. **Initial Overview**: A brief summary of the core idea or concept, including its basic definition or understanding in common parlance or within specific domains if applicable.
2. **Exploratory Questions**: A list of open-ended questions that stem from the initial idea, designed to provoke thought, uncover underlying assumptions, or explore potential implications and applications.
3. **Possibilities and Scenarios**: Detailed descriptions of possible scenarios, applications, or manifestations of the idea in various contexts. This section should aim to broaden the horizon of the initial concept, suggesting innovative or unconventional perspectives.
4. **Related Topics and Ideas**: Identification of closely and peripherally related topics, ideas, or concepts that could enrich or be enriched by the initial idea. This may include cross-disciplinary links, opposing viewpoints, or complementary concepts.
5. **Resources for Further Exploration**: A curated list of suggested readings, resources, or activities that could deepen understanding or expand the exploration of the idea. This could include books, articles, podcasts, or interactive tools.

Example Input:
"Explore the concept of 'Artificial Intelligence' with a focus on its implications for creative industries, considering ethical considerations and future innovation opportunities."

Example Output:
1. **Initial Overview**: Artificial Intelligence (AI) refers to the simulation of human intelligence in machines...
2. **Exploratory Questions**: What are the ethical implications of AI in art creation? Can AI truly replicate the creative process of humans?...
3. **Possibilities and Scenarios**: In the realm of music production, AI could revolutionize...
4. **Related Topics and Ideas**: Machine Learning, Creativity, Ethical AI, Human-AI Collaboration...
5. **Resources for Further Exploration**: "Life 3.0" by Max Tegmark, TED Talks on AI and creativity...

Usage Note: This prompt format can be adapted and expanded based on the complexity of the idea or concept being explored and the depth of exploration desired.`;

let titlePrompt = "Given the content and key insights of a blog post, distill its essence and main arguments into a concise, compelling title that captures the reader's attention and accurately reflects the post's themes and conclusions.";

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

  async function generateImageFromDalle(prompt: string) {
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
          titlePrompt + "This is the user's inspiration: '" + chatGptPrompt + "'"
        ),
        generateGptRequest("Generate 3 to 5 tags for a blog post titled '" + chatGptPrompt + "'"
        ),
        generateGptRequest(promptFormat + "This is the user's inspiration: '" + chatGptPrompt + "'"),
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
