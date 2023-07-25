import { client } from "$lib/pocketbase";
import type { PageLoad } from "./$types";

export const load: PageLoad = async function ({ params: { coll, id } }) {
  const logs = await client.collection("auditlog").getFullList({
    // TODO: access control
    filter: `record="${id}" && collection="${coll}"`,
    expand: "user",
  });
  return {
    logs,
  };
};
