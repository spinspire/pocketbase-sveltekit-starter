import { client } from "$lib/pocketbase";
import type { Record } from "pocketbase";
import type { PageLoad } from "./$types";

export const load: PageLoad = async function ({ url, params: { slug } }) {
  const id = url.searchParams.get('id');
  let post: Record;
  if (id) {
    post = await client.records.getOne('posts', id);
  } else {
    const { items } = await client.records.getList('posts', undefined, undefined, {
      filter: `slug="${slug}"`,
    });
    ([post] = items);
  }

  return {
    post,
  }
}