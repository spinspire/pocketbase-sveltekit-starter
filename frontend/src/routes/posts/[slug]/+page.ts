import { client } from "$lib/pocketbase";
import type { PageLoad } from "./$types";

export const load: PageLoad = async function ({ url, params: { slug } }) {
  const { items } = await client.records.getList('posts', undefined, undefined, {
    filter: `slug="${slug}"`,
  });
  const [post] = items;

  return {
    post,
  }
}