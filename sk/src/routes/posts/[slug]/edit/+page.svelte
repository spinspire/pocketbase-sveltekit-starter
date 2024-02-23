<script lang="ts">
import { goto } from "$app/navigation";
import { metadata } from "$lib/app/stores";
import { authModel, save } from "$lib/pocketbase";
import { alertOnFailure } from "$lib/pocketbase/ui";
import type { PageData } from "./$types";
import Markdown from "svelte-markdown";

export let data: PageData;


$: ({ post } = data);
$: $metadata.title = post.title;
$: $metadata.description = "";

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

Usage Note: This prompt format can be adapted and expanded based on the complexity of the idea or concept being explored and the depth of exploration desired. Use eleborate markdown and emojis to make the output more engaging and visually appealing.`;

let titlePrompt =
  "Given the content and key insights of a blog post, distill its essence and main arguments into a concise, compelling title that captures the reader's attention and accurately reflects the post's themes and conclusions. The title should be clear, engaging, and informative, providing a strong indication of the post's content and value. Do not output the body or tags, ONLY the title. The title should be a single sentence and should not exceed 35 characters. It should not end with a period. The title should be written in title case, with all words capitalized except for articles, prepositions, and conjunctions. Do not use any format other than the one specified";

let tagPrompt =
  "Please summarize the provided blog article, focusing on its main points and themes. Following your summary, identify and list 3-5 relevant tags that capture the essence of the article. These tags should be short, lowercase, single words, and separated by commas. Ensure the tags strictly adhere to this format: 'example1, example2, example3'. Do not include spaces between the commas and words, and do not use any format other than the one specified. Do not output the summary ONLY the tags.";

let blogSummaryPrompt =
  "Please review the provided blog article thoroughly. After your review, compose a few sentences summary that encapsulates the main points and themes of the article. It should be between 40-80 words exactlyThis summary should be concise and engaging, designed to accompany the article's title on a Tailwind CSS card as a brief overview. Ensure the summary captures the essence of the blog, highlighting its value or unique perspective to intrigue and inform potential readers.Use eleborate markdown and emojis to make the output more engaging and visually appealing. Do not output the body or tags, ONLY the summary. Do not use any format other than the one specified.";

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

<main class="container mx-auto my-12 px-4 sm:px-6 lg:px-8">
  <div class="grid gap-8 lg:grid-cols-3">
    <!-- Form and GPT Prompt -->
    <section class="space-y-6 lg:col-span-2">
      <div class="bg-base-200 p-6">
        <h1 class="mb-4 text-xl font-semibold">Create a New Journal Entry</h1>
        <form on:submit|preventDefault={submit} class="space-y-4">
          <div class="form-control w-full">
            <label class="label" for="title">
              <span class="label-text">Title</span>
            </label>
            <input
              type="text"
              id="title"
              name="title"
              bind:value={post.title}
              class="input input-bordered w-full"
              placeholder="Your journal title"
            />
          </div>

          <div class="form-control w-full">
            <label class="label" for="slug">
              <span class="label-text">Slug</span>
            </label>
            <input
              type="text"
              id="slug"
              name="slug"
              bind:value={post.slug}
              class="input input-bordered w-full"
              placeholder="your-journal-title"
            />
          </div>

          <div class="form-control w-full">
            <label class="label" for="body">
              <span class="label-text">Body</span>
            </label>
            <textarea
              id="body"
              name="body"
              bind:value={post.body}
              rows="10"
              class="textarea textarea-bordered w-full"
              placeholder="What's on your mind?"
            ></textarea>
          </div>

          <div class="form-control w-full">
            <label class="label" for="tags">
              <span class="label-text">Tags</span>
            </label>
            <input
              id="tags"
              name="tags"
              bind:value={post.tags}
              class="input input-bordered w-full"
              placeholder="Tags, comma separated"
            />
          </div>

          <button type="submit" class="btn btn-primary">Submit</button>
        </form>
      </div>

      <div class="bg-base-200 p-6">
        <h2 class="mb-4 text-lg font-semibold">GPT Prompt</h2>
        <div class="form-control">
          <textarea
            class="textarea h-24 w-full"
            placeholder="Enter your GPT prompt here"
            bind:value={chatGptPrompt}
          ></textarea>
          <button class="btn btn-primary mt-4" on:click={() => generateFromChatGPT(chatGptPrompt)}
            >Generate</button
          >
        </div>
      </div>
    </section>

    <!-- Blog Cards -->
    <aside class="space-y-4">
      <div class="card bg-base-200">
        <figure>
          <img
            src={post.featuredImage || 'https://via.placeholder.com/256x256.png?text=AI+Blog'}
            alt={post.title}
          />
        </figure>
        <div class="card-body">
          <h3 class="card-title">
            <a href="#" class="text-lg font-bold">{post.title}</a>
          </h3>
          <p>{post.blogSummary || 'No summary available.'}</p>
          <div class="card-actions justify-end">
            {#if post.tags}
              {#each post.tags.split(',') as tag}
                <div class="badge badge-outline">{tag.trim()}</div>
              {/each}
            {:else}
              <div class="badge badge-outline">No Tags</div>
            {/if}
          </div>
        </div>
      </div>
    </aside>
  </div>
</main>

<style>
</style>
