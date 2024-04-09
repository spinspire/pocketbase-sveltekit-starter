<script lang="ts">
import { goto } from "$app/navigation";
import { page } from "$app/stores";
import { onMount } from "svelte";
import { postsStore } from "$lib/stores/postStore";
import { updatePost, fetchPostBySlug } from "$lib/services/postService";
import type { PostsResponse } from "$lib/pocketbase/generated-types";
import Markdown from "svelte-markdown";
import {
  generateTextFromChatGPT,
  generateImageFromDalle,
  ensureTagsExist,
} from "$lib/utils/api";
import {
  promptFormat,
  titlePrompt,
  tagPrompt,
  blogSummaryPrompt,
} from "$lib/utils/prompts";
let post: PostsResponse | undefined;
let tagString = "";
$: slug = $page.params.slug;
console.log("Received slug:", slug);
// Check the received slug value
onMount(async () => {
  try {
    post = await fetchPostBySlug(slug);
    if (!post) {
      console.log("Post not found");
      // Handle the case when the post is not found
      // For example, you can redirect to a 404 page or show an error message
    } else {
      tagString = post.tags ? post.tags.join(", ") : "";
    }
  } catch (error) {
    console.error("Error fetching post:", error);
    // Handle the error case // For example, you can show an error message to the user
  }
});
// Rest of the code for editing and updating the post

async function submit(e: SubmitEvent) {
  e.preventDefault();

  if (!post) return;

  const tagsArray = tagString
    .split(",")
    .map((tag) => tag.trim())
    .filter((tag) => tag.length > 0);

  const updatedPost = {
    ...post,
    title: post.title,
    slug: post.slug,
    body: post.body,
    blogSummary: post.blogSummary,
    prompt: post.prompt,
    featuredImage: post.featuredImage,
  };

  await updatePost(post.id, updatedPost);
  await updatePostsTagsRelationships(post.id, tagsArray);

  goto(`/posts/${post.slug}`);
}

async function updatePostsTagsRelationships(
  postId: string,
  tagsArray: string[]
) {
  const tagIds = await ensureTagsExist(tagsArray);
  await updatePost(postId, { tags: tagIds });
}

async function generateFromChatGPT(userPrompt: string) {
  if (userPrompt.length === 0) {
    alert("Please enter a prompt to generate from.");
    return;
  } else if (!post) return;

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
  {#if post}
    <div class="grid gap-8 lg:grid-cols-3">
      <section class="space-y-6 lg:col-span-2">
        <div class="border p-6">
          <h2 class="mb-4 text-lg font-semibold">GPT Prompt</h2>
          <div class="form-control">
            <textarea
              class="textarea h-24 w-full"
              placeholder="Enter your GPT prompt here"
              bind:value={post.prompt}
            ></textarea>
            <button
              class="btn btn-primary mt-4"
              on:click={() => generateFromChatGPT(post?.prompt ?? '')}
              >Generate</button
            >
          </div>
        </div>
        <div class="border p-6">
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
      </section>

      <aside class="space-y-4">
        <div class="card border">
          <figure>
            <img
              src={post.featuredImage || 'https://via.placeholder.com/256x256.png?text=AI+Blog'}
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
  {:else}
    <p>Loading post...</p>
  {/if}
</main>
