// lib/services/postsService.ts
import { client } from '$lib/pocketbase';
import { writable } from 'svelte/store';
import type { PostsResponse } from '$lib/pocketbase/generated-types';

async function populatePostData(post: PostsResponse): Promise<PostsResponse> {
  if (post.expand?.featuredImage) {
    const image = post.expand.featuredImage;
    if ('file' in image && 'id' in image && 'collectionId' in image && 'collectionName' in image) {
      try {
        post.featuredImage = client.getFileUrl(image, image.file);
      } catch (error) {
        console.error('Error getting featured image URL:', error);
        post.featuredImage = undefined; // Set featuredImage to undefined if there's an error
      }
    }
  } else if (post.featuredImage) {
    try {
      const image = await client.collection('images').getOne(post.featuredImage);
      if ('file' in image) {
        post.featuredImage = client.getFileUrl(image, image.file);
      }
    } catch (error) {
      console.error('Error fetching featured image:', error);
      post.featuredImage = undefined; // Set featuredImage to null if there's an error
    }
  }

  if (post.expand?.tags) {
    post.tags = post.expand.tags.map((tag: { title: string }) => tag.title);
  } else if (post.tags && post.tags.length > 0) {
    const tagIds = post.tags.map((tagId) => `id = "${tagId}"`).join(' || ');
    try {
      const tags = await client.collection('tags').getFullList(undefined, { filter: tagIds });
      post.tags = tags.map((tag) => tag.title);
    } catch (error) {
      console.error('Error fetching tags:', error);
      post.tags = []; // Set tags to an empty array if there's an error
    }
  }

  return post;
}

export async function fetchPosts(page = 1, perPage = 20) {
  try {
    const postsResponse = await client.collection('posts').getList<PostsResponse>(page, perPage, {
      sort: '-updated',
      expand: 'featuredImage,tags',
    });

    const posts = await Promise.all(postsResponse.items.map(populatePostData));
    const postsData = {
      posts: posts,
      page: postsResponse.page,
      perPage: postsResponse.perPage,
      totalPages: postsResponse.totalPages
    };
    postsStore.set(postsData);
  } catch (error) {
    console.error('Error fetching posts:', error);
    throw error;
  }
}

export async function fetchPostBySlug(slug: string) {
  try {
    const postsResponse = await client.collection('posts').getFirstListItem<PostsResponse>(`slug = '${slug}'`, {
      expand: 'featuredImage,tags',
    });

    const post = await populatePostData(postsResponse);
    return post;
  } catch (error) {
    console.error('Error fetching post:', error);
    throw error;
  }
}

export async function createPost(postData: Partial<PostsResponse>) {
  try {
    const createdPost = await client.collection('posts').create<PostsResponse>(postData);
    const populatedPost = await populatePostData(createdPost);
    postsStore.update((store) => {
      return {
        ...store,
        posts: [...store.posts, populatedPost]
      };
    });
  } catch (error) {
    console.error('Error creating post:', error);
    throw error;
  }
}

export async function updatePost(postId: string, postData: Partial<PostsResponse>) {
  try {
    const updatedPost = await client.collection('posts').update<PostsResponse>(postId, postData);
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
  } catch (error) {
    console.error('Error updating post:', error);
    throw error;
  }
}

export async function deletePost(postId: string) {
  try {
    await client.collection('posts').delete(postId);
    postsStore.update((store) => {
      return {
        ...store,
        posts: store.posts.filter((post) => post.id !== postId)
      };
    });
  } catch (error) {
    console.error('Error deleting post:', error);
    throw error;
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

