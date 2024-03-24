import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";
import adapter from "@sveltejs/adapter-static";
import preprocess from "svelte-preprocess";

/** @type {import('@sveltejs/kit').Config} */
const config = {
  preprocess: [
    preprocess({
      postcss: true,
    }),
    vitePreprocess(),
  ],

  kit: {
    adapter: adapter({
      pages: "build",
      assets: "build",
      fallback: "index.html",
      precompress: true,
      strict: true,
    }),
    paths: {
      base: process.env.BASE_PATH ?? "",
    },
    alias: {
      $lib: "src/lib",
    },
    prerender: {
      entries: ['*', '/posts/[slug]'],
    },
  },
};

export default config;
