import { client } from "$lib/pocketbase";
import type { PageLoad } from "./$types";

export const load: PageLoad = async ({ fetch }) => {
  // client.send instead of "fetch" because it includes auth token
  const hello = await client.send("/api/hello", { fetch });
  return {
    hello,
  };
};
