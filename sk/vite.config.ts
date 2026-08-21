import { sveltekit } from "@sveltejs/kit/vite";
import type { UserConfig } from "vite";

const pocketbase_url = process.env.POCKETBASE_URL || "http://127.0.0.1:8090";

const config: UserConfig = {
  plugins: [sveltekit()],
  server: {
    allowedHosts: true,
    proxy: {
      // proxy "/api" and "/_" to pocketbase
      "/api": pocketbase_url,
      "/_": pocketbase_url,
    },
  },
};

export default config;
