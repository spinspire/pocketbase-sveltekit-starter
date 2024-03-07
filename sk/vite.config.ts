import { sveltekit } from "@sveltejs/kit/vite";
import type { UserConfig } from "vite";
import fs from "fs";

// detect if we're running inside docker and set the backend accordingly
const pocketbase_url = fs.existsSync("/.dockerenv")
  ? "http://pb:8890" // docker-to-docker
  : "http://localhost:8080"; // localhost-to-localhost

const config: UserConfig = {
  plugins: [sveltekit()],
  server: {
    proxy: {
      // proxy "/api" and "/_" to pocketbase_url
      "/api": pocketbase_url,
      "/_": pocketbase_url
    },
  },
};

export default config;
