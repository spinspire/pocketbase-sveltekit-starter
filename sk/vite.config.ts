import { sveltekit } from "@sveltejs/kit/vite";
import type { UserConfig } from "vite";

// @ts-ignore -- process.env is available in Vite config (Node.js context)
const pocketbase_url = process.env.POCKETBASE_URL || "http://127.0.0.1:8090";

const config: UserConfig = {
  plugins: [sveltekit()],
  server: {
    allowedHosts: true,
    watch: {
      // Use polling for reliable file-change detection inside Docker bind mounts.
      // Native inotify misses deletions/renames through volume mounts intermittently.
      usePolling: true,
      interval: 300,
    },
    proxy: {
      // proxy "/api" and "/_" to pocketbase
      "/api": pocketbase_url,
      "/_": pocketbase_url,
    },
  },
};

export default config;
