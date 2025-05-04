// Store for metadata
import { writable } from "svelte/store";

// Create a writable store for metadata
export const metadata = writable({
  title: "Pocketbase Sveltekit Starterkit",
  headline: "Pocketbase Sveltekit Starterkit",
  description: "A SvelteKit + PocketBase app",
});
