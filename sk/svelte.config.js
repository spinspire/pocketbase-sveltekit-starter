import adapter from "@sveltejs/adapter-static";
import preprocess from "svelte-preprocess";
import { mdsvex } from "mdsvex";

/** @type {import('@sveltejs/kit').Config} */
const config = {
  extensions: [".svelte", ".md"],
  preprocess: [
    preprocess(),
    mdsvex({
      extensions: [".md"],
    }),
  ],

  kit: {
    alias: {
      $lib: "src/lib",
    },
    adapter: adapter({
      // Prerendering turned off. Turn it on if you know what you're doing.
      prerender: { entries: [] },
      fallback: "index.html", // enable SPA mode
    }),
  },
};

export default config;
