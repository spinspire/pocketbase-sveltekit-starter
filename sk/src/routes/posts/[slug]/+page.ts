import { client } from "$lib/pocketbase";
import type { PageLoad } from "./$types";

export const load: PageLoad = async function ({ params }) {
  const { slug } = params;
  console.log("slug", slug);

  try {
    // Disable auto-cancellation for the post request
    client.autoCancellation(false);

    // Fetch the post by slug
    const response = await client
      .collection("posts")
      .getList(1, 50, { filter: `slug = '${slug}'` });
    const items = response.items;

    console.log("items", items);

    if (items.length === 0) {
      throw new Error("Post not found");
    }

    const post: {
      userid: any;
      id: string;
      title: string;
      slug: string;
      body: string;
      tags: string[];
      blogSummary: string;
      featuredImage: string;
      prompt: string;
    } = items[0];

    let featuredImageUrl = "";

    // Check if the post has a featuredImage
    if (post.featuredImage) {
      // Assuming post.featuredImage is the ID you need to use to fetch the image from the 'images' collection
      const image = await client
        .collection("images")
        .getOne(post.featuredImage);
      console.log("image", image);

      if (image && image.file) {
        // Construct the URL for the image
        featuredImageUrl = client.getFileUrl(image, image.file);
        console.log("featuredImageUrl", featuredImageUrl);
      }
    }

    // Fetch the tags associated with the post
    const postTagsRelations = await client.collection("postsTags").getFullList({
      filter: `posts = '${post.id}'`,
    });
    console.log("postTagsRelations", postTagsRelations);

    // Extract the tag IDs from the relations
    const tagIds = postTagsRelations.map((rel) => rel.tags);

    // ... existing code ...

    // Fetch the tag details for each tag ID
    const tags = await Promise.all(
      tagIds.map((tagId) => client.collection("tags").getOne(tagId))
    );
    console.log("tags", tags);

    // Remove duplicate tags
    const uniqueTags = Array.from(
      new Set(tags.map((tag) => JSON.stringify(tag)))
    ).map((str) => JSON.parse(str));

    // Return the post, the URL for the featured image, and the unique tags
    return { post, featuredImageUrl, tags: uniqueTags };

    // ... existing code ...
  } catch (error) {
    console.error("Error fetching post:", error);
    throw error;
  }
};
