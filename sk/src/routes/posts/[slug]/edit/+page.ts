import { client } from "$lib/pocketbase";
import type { PostsRecord } from "$lib/pocketbase/generated-types";
import type { PageLoad } from "./$types";
import { goto } from "$app/navigation";
import { metadata } from "$lib/app/stores";
import { authModel, save } from "$lib/pocketbase";
import type { PageData } from "./$types";

export const load: PageLoad = async function ({ params }) {
  const { slug } = params;

  try {
    const { items } = await client.collection("posts").getList(undefined, undefined, {
      filter: `slug='${slug}'`,
    });

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

    if (post.featuredImage) {
      const image = await client.collection("images").getOne(post.featuredImage);

      if (image && image.file) {
        featuredImageUrl = client.getFileUrl(image, image.file);
      }
    }

    return { post, featuredImageUrl };
  } catch (error) {
    console.error("Error fetching post:", error);
    throw error;
  }
};