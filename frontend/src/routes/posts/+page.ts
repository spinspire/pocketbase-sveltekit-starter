import { client } from "$lib/pocketbase";
import type { PageLoad } from "./$types";

export const load: PageLoad = async function () {
  const posts = await client.collection("posts").getFullList(undefined, {
    sort: "-updated",
  });
  return {
    posts,
  };
};
