import type { HandleFetch } from "@sveltejs/kit"
import { env } from "$env/dynamic/public";

export const handleFetch: HandleFetch = async ({ request, fetch, event }) => {
  // path regex that we would like to replace
  const regex = /^(http:..sveltekit-prerender)?\/api\//;
  // but only if PUBLIC_BACKEND env var was provided
  const apiBackend = env.PUBLIC_BACKEND;
  if (apiBackend && regex.test(request.url)) {
    request = new Request(
      // replace ".../api/..." with backend + "/api/..."
      apiBackend + request.url.replace(regex, "/api/"),
      request
    );
    // Workaround: https://github.com/sveltejs/kit/issues/6608
    // to prevent CORS errors during prerender
    request.headers.set('origin', event.url.origin);
  }

  return fetch(request)
}
