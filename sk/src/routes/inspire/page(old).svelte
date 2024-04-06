<script lang="ts">
import { metadata } from "$lib/app/stores";
import { goto } from "$app/navigation";
import { authModel, save, watch } from "$lib/pocketbase";
import { alertOnFailure } from "$lib/pocketbase/ui";
import type { PageData } from "./$types";
import Markdown from "svelte-markdown";
import TagGroup from "$lib/components/TagGroup.svelte";
import { client } from "$lib/pocketbase";
import { onMount, createEventDispatcher } from "svelte";
import type {
  PostsResponse,
  Collections,
} from "$lib/pocketbase/generated-types";
import { tagTreePrompt } from "$lib/utils/prompts";
import PostList from "$lib/components/PostList.svelte";
import { availableServices } from "$lib/utils/api";
import TreeView from "$lib/components/TreeView.svelte";
import { generateTagTree } from "$lib/services/generateBlog";

$: test = "";
$metadata.title = "explore";
$metadata.description = "explore ai";

const dispatch = createEventDispatcher();
let posts: PostsResponse[] = [];
let tags: string[] = [];
let selectedTags: string[] = [];
let isLoading = false;
let treeDataJson: string[] = [];

async function fetchTags() {
  try {
    const postsResponse = await client.collection("posts").getFullList({
      expand: "tags",
    });
    console.log("postsResponse", postsResponse);

    const allTags = new Set<string>();

    for (const post of postsResponse) {
      const tagsTemp: Record<string, any> | Record<string, any>[] =
        post.expand?.tags;
      if (Array.isArray(tagsTemp)) {
        for (const tag of tagsTemp) {
          if (tag && typeof tag.title === "string") {
            allTags.add(tag.title);
          }
        }
      } else if (tagsTemp && typeof tagsTemp.title === "string") {
        allTags.add(tagsTemp.title);
      }
    }

    console.log("allTags", allTags);
    tags = Array.from(allTags);
    console.log("tags", tags);
    return tags;
  } catch (error) {
    console.error("Error fetching tags:", error);
  }
}
async function sortTags(prompt: string) {
  isLoading = true;
  try {
    treeDataJson = [await generateTagTree(tags.toString(), authModel)];
console.log("treeDataJson", treeDataJson);
    // Parse the response and create the tree structure
    // Update the UI with the sorted tags
  } catch (error) {
    console.error("Error sorting tags:", error);
  }
  isLoading = false;
}

async function fetchPostsByTags() {
  try {
    const postsResponse = await client.collection("posts").getList(1, 50, {
      sort: "-updated",
      expand: "featuredImage,tags",
      filter: selectedTags.map((tag) => `tags.title="${tag}"`).join("||"),
    });
    posts = postsResponse.items.map((post) => {
      const { expand, ...rest } = post;
      return {
        ...rest,
        title: post.title as string,
        slug: post.slug as string,
        body: post.body as string,
        tags: expand.tags
          ? expand.tags.map((tag: { title: string }) => tag.title)
          : [],
        collectionName: "posts" as Collections,
      };
    });
  } catch (error) {
    console.error("Error fetching posts:", error);
  }
}

onMount(async () => {
  await fetchTags();
  await sortTags(tagTreePrompt);
});
</script>

{#if isLoading}
  <div>Loading...</div>
{:else}
  <div>
    <!-- Display the sorted tag tree -->
    <!-- Allow user to select multiple tags -->
    <TreeView treeData={treeDataJson} />
  </div>

  <div>
    <PostList posts={posts} />
  </div>
{/if}
