<script lang="ts">
import { goto } from "$app/navigation";
import { metadata } from "$lib/app/stores";
import { authModel, client, save } from "$lib/pocketbase";
import { alertOnFailure } from "$lib/pocketbase/ui";
import type { PageData } from "./$types";
import Markdown from "svelte-markdown";
export let featuredImageUrl: string;
export let data: PageData;
import { onMount } from "svelte";

$: if (data) {
  const {
    post: {
      id,
      title,
      slug,
      body,
      tags,
      blogSummary,
      featuredImage,
      prompt,
      userid,
    },
    featuredImageUrl: newFeaturedImageUrl,
  } = data;
  featuredImageUrl = newFeaturedImageUrl;
  $metadata.title = title;
}

import {
  promptFormat,
  titlePrompt,
  tagPrompt,
  blogSummaryPrompt,
} from "$lib/utils/prompts";
import { page } from "$app/stores";
import Delete from "$lib/components/Delete.svelte";

$: ({ post } = data);
$: $metadata.title = post.title;
$: $metadata.description = "";

let chatGptPrompt: string = "";
let chatGptResponse: string = "";
let chatGptTitle: string = ""; // Variable for title
let chatGptSlug: string = ""; // Variable for slug
let chatGptTags: string = ""; // Variable for tags
let tagString = ""; // Will hold the comma-separated tags

onMount(async () => {
    if (data && data.post) {
      // Fetch the related tags for the post
      const postsTagsResponse = await client.collection('postsTags').getList(1, 50, {
        filter: `posts = "${data.post.id}"`,
      });
      console.log("Posts Tags Response:", postsTagsResponse);
      const tagIds = postsTagsResponse.items.map((postTag) => postTag.tags);
      console.log("Tag IDs:", tagIds);
      const tags = await Promise.all(
        tagIds.map((tagId) => client.collection('tags').getOne(tagId))
      );
      console.log("Tags:", tags);
      tagString = tags.map(tag => tag.title).join(', ');
      console.log("Tag String:", tagString);
    }
  });

  async function submit(e: SubmitEvent) {
    e.preventDefault();

    // Handle the tags
    const tagsArray = tagString.split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0);


    // Validate the tags here (e.g., check for duplicates or invalid characters)
    // This is a placeholder for your validation logic

    // Update the post with any other changes
    const updatedPost = {
      ...data.post,
      // ... other fields like title, body, etc.
    };

    // Save the post
    const savedPost = await save('posts', updatedPost);

    // Update the postsTags relationships
    await updatePostsTagsRelationships(savedPost.id, tagsArray);

    // Redirect after successful save
    goto(`/posts/${savedPost.slug}`);
  }

  async function updatePostsTagsRelationships(postId: string, tagsArray: string[]) {
    // Delete old postsTags relationships
    const oldPostsTags = await client.collection('postsTags').getList(1, 50, {
      filter: `posts = "${postId}"`,
    });
    for (const postTag of oldPostsTags.items) {
      await client.collection('postsTags').delete(postTag.id);
    }

    // Create new postsTags relationships
    for (const tagTitle of tagsArray) {
      // Check if the tag exists
      const existingTags = await client.collection('tags').getList(1, 1, {
        filter: `title = "${tagTitle}"`,
      });

      let tagId;
      if (existingTags.items.length === 0) {
        // Create the tag if it doesn't exist
        const newTag = await client.collection('tags').create({ title: tagTitle });
        tagId = newTag.id;
      } else {
        // Use the existing tag
        tagId = existingTags.items[0].id;
      }

      // Create the postsTags relationship
      await client.collection('postsTags').create({
        posts: postId,
        tags: tagId,
      });
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
    userid: post.userid,
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
            <article class="prose lg:prose-lg mx-auto text-justify">
              <Markdown source={data.post.body} />
            </article>
          </div>

          <div class="form-control w-full">
            <label class="label" for="tags">
              <span class="label-text">Tags</span>
            </label>
            <input
              type="text"
              id="tags"
              name="tags"
              bind:value={tagString}
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
            bind:value={post.prompt}
          ></textarea>
          <button
            class="btn btn-primary mt-4"
            on:click={() => generateFromChatGPT(chatGptPrompt)}>Generate</button
          >
        </div>
      </div>
    </section>

    <!-- Blog Cards -->
    <aside class="space-y-4">
      <div class="card bg-base-200">
        <figure>
          <img
            src={featuredImageUrl || 'https://via.placeholder.com/256x256.png?text=AI+Blog'}
            alt={post.title}
          />
        </figure>
        <div class="card-body">
          <h3 class="card-title">
            <a href="#" class="text-lg font-bold">{post.title}</a>
          </h3>
          <p>{post.blogSummary || 'No summary available.'}</p>
          <div class="card-actions justify-end">
            {#if tagString}
              {#each tagString.split(',') as tag (tag)}
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
