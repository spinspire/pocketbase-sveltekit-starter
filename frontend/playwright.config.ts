import type { PlaywrightTestConfig } from "@playwright/test";

const config: PlaywrightTestConfig = {
  use: {
    headless: false,
    // viewport: { width: 1280, height: 768 },
    // video: "on-first-retry",
    // make sure "npm run dev" is running for localhost:5173 to work
    baseURL: "http://localhost:5173",
  },
  reporter: [["html"]],
};

export default config;
