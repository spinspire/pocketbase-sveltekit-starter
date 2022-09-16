import { sveltekit } from '@sveltejs/kit/vite';
import type { UserConfig } from 'vite';

const config: UserConfig = {
  plugins: [sveltekit()],
  server: {
    proxy: {
      '/api': 'http://127.0.0.1:8090',
    }
  }
};

export default config;
