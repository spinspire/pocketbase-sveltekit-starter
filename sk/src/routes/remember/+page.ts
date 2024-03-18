import type { PageLoad } from "./$types";
import { client } from "$lib/pocketbase";

export const load: PageLoad = async () => {
  try {
    // Fetch posts
    const postsResponse = await client.collection("posts").getList(1, 50, {
      sort: "-updated",
      expand: "featuredImage",
    });

    // Extract the post IDs from the response
    const postIds = postsResponse.items.map((post) => post.id);

    // Fetch postsTags records for all posts in a single request
    const postsTagsResponse = await client.collection("postsTags").getList(1, 100, {
      filter: `posts.id = "${postIds.join('" || posts.id = "')}"`,
    });

    // Create a map of post IDs to their corresponding tag IDs
    const postTagMap = new Map<string, string[]>();
    postsTagsResponse.items.forEach((postTag) => {
      const postId = postTag.posts;
      const tagId = postTag.tags;
      if (postTagMap.has(postId)) {
        postTagMap.get(postId)!.push(tagId);
      } else {
        postTagMap.set(postId, [tagId]);
      }
    });

    // Fetch tag details for all unique tag IDs in a single request
const uniqueTagIds = [...new Set(postsTagsResponse.items.map((postTag) => postTag.tags))];
console.log("uniqueTagIds", uniqueTagIds);

const tagsResponse = await client.collection("tags").getList(1, 100, {
  filter: `id = "${uniqueTagIds.join('" || id = "')}"`,
});
console.log("tagsResponse", tagsResponse);

// Create a map of tag IDs to their corresponding titles
const tagTitleMap = new Map<string, string>();
tagsResponse.items.forEach((tag) => {
  console.log("tag", tag);
  tagTitleMap.set(tag.id, tag.title);
});
console.log("tagTitleMap", tagTitleMap);

// Assign tags to each post
const postsWithTags = postsResponse.items.map((post) => {
  const tagIds = postTagMap.get(post.id) || [];
  const flattenedTagIds = tagIds.flat(); // Flatten the tagIds array
  post.tags = flattenedTagIds.map((tagId) => {
    const tag = tagsResponse.items.find((t) => t.id === tagId);
    return tag ? tag.title : "";
  }).filter(Boolean);
  return post;
});

    console.log("postsWithTags", postsWithTags);

    return {
      posts: postsWithTags,
    };
  } catch (error) {
    console.error("Error fetching posts:", error);
    return {
      posts: [],
    };
  }
};