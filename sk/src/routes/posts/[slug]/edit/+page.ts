import { client } from "$lib/pocketbase";
import type { PostsRecord } from "$lib/pocketbase/generated-types";
import type { PageLoad } from "./$types";

export const load: PageLoad = async function ({ params: { slug: id } }) {
  const post: PostsRecord =
    id === "new"
      ? ({} as PostsRecord)
      : await client.collection("posts").getOne(id);

  return {
    post,
  };
};
