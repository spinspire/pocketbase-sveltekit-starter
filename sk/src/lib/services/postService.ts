// lib/services/postsService.ts
import { client } from "$lib/pocketbase";
import { writable } from "svelte/store";
import type { PostsResponse } from "$lib/pocketbase/generated-types";

async function populateFeaturedImage(
  post: PostsResponse
): Promise<string | undefined> {
  if (post.expand?.featuredImage) {
    const image = post.expand.featuredImage;
    if (
      "file" in image &&
      "id" in image &&
      "collectionId" in image &&
      "collectionName" in image
    ) {
      try {
        return client.getFileUrl(image, image.file);
      } catch (error) {
        console.error("Error getting featured image URL:", error);
        return "https://via.placeholder.com/800x400.png?text=cool+wind"; // Set a default image URL
      }
    }
  }
  return undefined;
}

async function populateTags(post: PostsResponse): Promise<string[]> {
  if (post.expand?.tags) {
    return post.expand.tags.map((tag: { title: string }) => tag.title);
  } else if (post.tags && post.tags.length > 0) {
    const tagIds = post.tags.map((tagId) => `id = "${tagId}"`).join(" || ");
    try {
      const tags = await client
        .collection("tags")
        .getFullList(undefined, { filter: tagIds });
      return tags.map((tag) => tag.title);
    } catch (error) {
      console.error("Error fetching tags:", error);
      return []; // Return an empty array as a fallback
    }
  }
  return [];
}

async function populatePostData(post: PostsResponse): Promise<PostsResponse> {
  const featuredImage = await populateFeaturedImage(post);
  const tags = await populateTags(post);
  return { ...post, featuredImage, tags };
}

export async function fetchPosts(
  page = 1,
  perPage = 20
): Promise<{
  posts: PostsResponse[];
  page: number;
  perPage: number;
  totalPages: number;
} | null> {
  try {
    const postsResponse = await client
      .collection("posts")
      .getList<PostsResponse>(page, perPage, {
        sort: "-updated",
        expand: "featuredImage,tags",
      });

    const posts = await Promise.all(postsResponse.items.map(populatePostData));
    const postsData = {
      posts: posts,
      page: postsResponse.page,
      perPage: postsResponse.perPage,
      totalPages: postsResponse.totalPages,
    };
    postsStore.set(postsData);
    return postsData;
  } catch (error) {
    console.error("Error fetching posts:", error);
    return null; // Return null to indicate an error occurred
  }
}

export async function fetchPostBySlug(slug: string) {
  try {
    // Encode the slug to handle special characters
    const encodedSlug = encodeURIComponent(slug);

    const postsResponse = await client
      .collection("posts")
      .getFirstListItem<PostsResponse>(`slug = "${encodedSlug}"`, {
        expand: "featuredImage,tags",
      });

    const post = await populatePostData(postsResponse);
    return post;
  } catch (error) {
    console.error("Error fetching post:", error);
    throw error;
  }
}

// Refactored createPost function
export async function createPost(
  postData: Partial<PostsResponse>,
  imagePrompt: string,
  engineId: string
): Promise<PostsResponse | null> {
  try {
    // Call the new createImage function
    const imageRecordId = await createImage(imagePrompt, engineId);

    // Set the featuredImage field to the image record ID
    postData.featuredImage = imageRecordId;

    // Create the post record
    const createdPost = await client
      .collection("posts")
      .create<PostsResponse>(postData);
    const populatedPost = await populatePostData(createdPost);
    postsStore.update((store) => {
      return {
        ...store,
        posts: [...store.posts, populatedPost],
      };
    });
    return populatedPost;
  } catch (error) {
    console.error("Error creating post:", error);
    return null;
  }
}

async function createImage(imagePrompt: string, engineId: string) {
  const imageResponse = await fetch("/api/dreamstudio", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt: imagePrompt }),
  });

  if (!imageResponse.ok) {
    throw new Error("Failed to upload image");
  }

  const imageData = await imageResponse.json();
  console.log("Image data:", imageData);
  return imageData.id;
}


export async function updatePost(
  postId: string,
  postData: Partial<PostsResponse>
): Promise<PostsResponse | null> {
  try {
    const updatedPost = await client
      .collection("posts")
      .update<PostsResponse>(postId, postData);
    const populatedPost = await populatePostData(updatedPost);
    postsStore.update((store) => {
      const index = store.posts.findIndex((post) => post.id === postId);
      if (index !== -1) {
        const updatedPosts = [...store.posts];
        updatedPosts[index] = populatedPost;
        return { ...store, posts: updatedPosts };
      }
      return store;
    });
    return populatedPost;
  } catch (error) {
    console.error("Error updating post:", error);
    return null; // Return null to indicate an error occurred
  }
}

export async function deletePost(postId: string): Promise<boolean> {
  try {
    await client.collection("posts").delete(postId);
    postsStore.update((store) => {
      return {
        ...store,
        posts: store.posts.filter((post) => post.id !== postId),
      };
    });
    return true; // Return true to indicate successful deletion
  } catch (error) {
    console.error("Error deleting post:", error);
    return false; // Return false to indicate an error occurred
  }
}

function createPostsStore() {
  const { subscribe, set, update } = writable<{
    posts: PostsResponse[];
    page: number;
    perPage: number;
    totalPages: number;
  }>({
    posts: [],
    page: 1,
    perPage: 20,
    totalPages: 1,
  });

  return {
    subscribe,
    set,
    update,
    appendPosts: (newPosts: PostsResponse[], totalPages: number) =>
      update((store) => ({
        ...store,
        posts: [...store.posts, ...newPosts],
        totalPages,
      })),
    reset: () => set({ posts: [], page: 1, perPage: 20, totalPages: 1 }),
  };
}

const postsStore = createPostsStore();
export { postsStore };
