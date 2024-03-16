import { client } from "$lib/pocketbase";
import type { PostsRecord } from "$lib/pocketbase/generated-types";
import type { PageLoad } from "./$types";
import { goto } from "$app/navigation";
import { metadata } from "$lib/app/stores";
import { authModel, save } from "$lib/pocketbase";
import type { PageData } from "./$types";

export const load: PageLoad = async function ({ params }) {
  const { slug } = params;
  console.log("slug", slug);

  try {
    // Fetch the post by slug
    const { items } = await client.collection("posts").getList(undefined, undefined, {
      filter: `slug='${encodeURIComponent(decodeURIComponent(slug))}'`,
    });
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
      const image = await client.collection("images").getOne(post.featuredImage);
      console.log("image", image);

      if (image && image.file) {
        // Construct the URL for the image
        featuredImageUrl = client.getFileUrl(image, image.file);
        console.log("featuredImageUrl", featuredImageUrl);
      }
    }

    // Return the post and the URL for the featured image
    return { post, featuredImageUrl };
  } catch (error) {
    console.error("Error fetching post:", error);
    throw error;
  }
};