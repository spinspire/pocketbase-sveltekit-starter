import { client } from "$lib/pocketbase";
import type {
  AuditlogResponse,
  UsersResponse,
} from "$lib/pocketbase/generated-types";
import type { PageLoad } from "./$types";

export const load: PageLoad = async function ({ params: { coll, id }, fetch }) {
  const logs = await client
    .collection("auditlog")
    .getFullList<AuditlogResponse<unknown, unknown, { user: UsersResponse }>>({
      // TODO: access control
      filter: client.filter("record={:id} && collection={:coll}", { id, coll }),
      expand: "user",
      fetch,
    });
  return {
    logs,
  };
};
