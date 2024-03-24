<script lang="ts">
import { goto } from "$app/navigation";
import { metadata } from "$lib/app/stores";
import { authModel, client, save } from "$lib/pocketbase";
import { alertOnFailure } from "$lib/pocketbase/ui";
import type { PageData } from "./$types";
import Markdown from "svelte-markdown";
import { onMount } from "svelte";
import {
  promptFormat,
  titlePrompt,
  tagPrompt,
  blogSummaryPrompt,
} from "$lib/utils/prompts";
import { page } from "$app/stores";
import Delete from "$lib/components/Delete.svelte";
import {
  generateTextFromChatGPT,
  generateImageFromDalle,
  ensureTagsExist,
} from "$lib/utils/api";

export let data: PageData;

$: ({ post } = data);
$: $metadata.title = post.title;
$: $metadata.description = post.blogSummary || "";
$: featuredImageUrl = data.featuredImageUrl;

let tagString = "";

onMount(async () => {
  if (data && data.post) {
  // Fetch the related tags for the post
  const tagsList: { id: string; title: string }[] = await client
    .collection("tags")
    .getFullList() as unknown as { id: string; title: string }[];

  console.log("tagsList", tagsList);

  const tagIds = data.post.tags; // Assuming the tags field in the post collection contains an array of tag IDs

  console.log("tagIds", tagIds);

  const tags = tagIds.map((tagId: string) => {
    console.log("Processing tagId:", tagId);

    const tag = tagsList.find((tag) => {
      console.log("Comparing tagId:", tagId, "with tag.id:", tag.id);
      return tag.id === tagId;
    });

    if (tag) {
      console.log("Found tag:", tag);
      return tag.title;
    } else {
      console.log("Tag not found for tagId:", tagId);
      return "";
    }
  });

  console.log("Mapped tags:", tags);

  const filteredTags = tags.filter((tag) => {
    if (tag === "") {
      console.log("Filtering out empty tag title");
    }
    return tag !== "";
  });

  console.log("Final tags array:", filteredTags);

  tagString = filteredTags.join(", ");
}
});

async function submit(e: SubmitEvent) {
  e.preventDefault();

  const tagsArray = tagString
    .split(",")
    .map((tag) => tag.trim())
    .filter((tag) => tag.length > 0);

  const updatedPost = {
    ...data.post,
    title: post.title,
    slug: post.slug,
    body: post.body,
    blogSummary: post.blogSummary,
    prompt: post.prompt,
    featuredImage: post.featuredImage,
  };

  const savedPost = await save("posts", updatedPost);

  await updatePostsTagsRelationships(savedPost.id, tagsArray);

  goto(`/posts/${savedPost.slug}`);
}

async function updatePostsTagsRelationships(
  postId: string,
  tagsArray: string[]
) {
  const tagIds = await ensureTagsExist(tagsArray);

  await client.collection("posts").update(postId, {
    tags: tagIds,
  });
}

async function generateFromChatGPT(userPrompt: string) {
  post.prompt = userPrompt;

  const bodyResponse = await generateTextFromChatGPT(
    promptFormat + "This is the user's inspiration: '" + post.prompt + "'"
  );
  post.body = bodyResponse;

  const titleResponse = await generateTextFromChatGPT(
    titlePrompt + "This is the user's article: '" + bodyResponse + "'"
  );
  post.title = titleResponse.replace(/["']/g, "");
  post.slug = titleResponse
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/["':]/g, "")
    .substring(0, 50);

  const tagsResponse = await generateTextFromChatGPT(
    tagPrompt + "This is the blog article: '" + bodyResponse + "'"
  );
  post.tags = [tagsResponse];

  const blogSummaryResponse = await generateTextFromChatGPT(
    blogSummaryPrompt + "This is the blog article: '" + bodyResponse + "'"
  );
  post.blogSummary = blogSummaryResponse;

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
  };
}
</script>

<main class="container mx-auto my-12 px-4 sm:px-6 lg:px-8">
  <div class="grid gap-8 lg:grid-cols-3">
    <section class="space-y-6 lg:col-span-2">
      <div class="bg-base-200 p-6">
        <h1 class="mb-4 text-xl font-semibold">Edit Journal Entry</h1>
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
              <Markdown source={post.body} />
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

          <button type="submit" class="btn btn-primary">Update</button>
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
            on:click={() => generateFromChatGPT(post.prompt)}>Generate</button
          >
        </div>
      </div>
    </section>

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
            <a href="/" class="text-lg font-bold">{post.title}</a>
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
