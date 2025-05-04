import { client, watch } from "$lib/pocketbase";
import type { PostsResponse } from "$lib/pocketbase/generated-types";
import type { PageLoad } from "./$types";

export const load: PageLoad = async ({ parent, fetch }) => {
  const filter = client.filter("user != ''", {});
  const expand = "user";
  const queryParams = {
    // filter,
    expand,
    fetch,
  };
  const posts = await watch<PostsResponse<any>>("posts", queryParams);
  return {
    posts,
  };
};
