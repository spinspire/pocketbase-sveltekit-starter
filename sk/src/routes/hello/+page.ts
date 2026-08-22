import { client } from "$lib/pocketbase";
import type { PageLoad } from "./$types";

export const load: PageLoad = async ({ fetch }) => {
  try {
    const hello = await client.send("/api/hello", { fetch });
    return { hello };
  } catch {
    return { hello: null };
  }
};
