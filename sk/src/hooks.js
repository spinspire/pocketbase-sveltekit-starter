import { base } from "$app/paths";

/** @type {import('@sveltejs/kit').Reroute} */
export function reroute({ url }) {
  const { pathname } = url;
  const [_, coll = "", id = "", op = ""] =
    pathname.match(/([^\/]+)\/([^\/]+)\/([^\/]+)\/?$/) || [];
  // implement virtual routes (aliases): .../delete and .../auditlog
  if (op === "auditlog" || op === "delete") {
    // render a different route (base route)
    // works only with some help from +layout.svelte in that path
    return `${base}/${coll}/${id}`;
  }
}
