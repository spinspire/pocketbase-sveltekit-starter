import type { LayoutLoad } from "./$types";
import { client } from "$lib/pocketbase";
import { alerts } from "$lib/components/Alerts.svelte";

// turn off SSR - we're JAMstack here
export const ssr = false;
// Prerendering turned off. Turn it on if you know what you're doing.
export const prerender = false;
// trailing slashes make relative paths much easier
export const trailingSlash = "always";

export const load: LayoutLoad = async ({ fetch }) => {
  let config: {
    site: {
      name: string;
      copyright: string;
      year: number;
    };
    signupAllowed: boolean;
  } = {} as any;

  try {
    config = await client.send("/api/config", { fetch, requestKey: "config" });
  } catch (e: any) {
    alerts.error(e.toString());
  }
  return {
    config,
  };
};
