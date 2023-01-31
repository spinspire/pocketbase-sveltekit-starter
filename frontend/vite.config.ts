import { sveltekit } from "@sveltejs/kit/vite";
import type { UserConfig } from "vite";

const config: UserConfig = {
  plugins: [sveltekit()],
  server: {
    proxy: {
      "/api": process.env.PUBLIC_POCKETBASE_URL ?? "",
    },
  },
};

export default config;
