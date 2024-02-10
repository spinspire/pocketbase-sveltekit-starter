import { client } from "$lib/pocketbase";
import type { PageLoad } from "./$types";

export const load: PageLoad = async function ({ url, params: { slug } }) {
  const { items } = await client
    .collection("posts")
    .getList(undefined, undefined, {
      filter: `slug='${encodeURIComponent(decodeURIComponent(slug))}'`,
    });

  const [post] = items;

  return {
    post,
  };
};
