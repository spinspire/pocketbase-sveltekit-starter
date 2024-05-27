import { client } from "$lib/pocketbase";
import type {
  PostsRecord,
  PostsResponse,
} from "$lib/pocketbase/generated-types";
import type { LayoutLoad } from "./$types";

export const load: LayoutLoad = async ({ params, fetch }) => {
  const { slug } = params;
  // search by both id and slug
  const filter = client.filter("id = {:slug} || slug = {:slug}", { slug });
  const coll = client.collection("posts");
  const options = { fetch };
  let record: PostsRecord = {
    title: "",
    body: "",
    user: "",
    slug: "",
    files: [],
  };
  if (slug !== "new") {
    // load record if existing
    record = await coll.getFirstListItem<PostsResponse>(filter, options);
  }
  return {
    record: record as PostsResponse,
  };
};
