import { writable } from "svelte/store";
import type { ServiceModelSelection } from "$lib/services/generateBlog"; // Replace "path/to/ServiceModelSelection" with the actual path to the module

export interface Metadata {
  title?: string;
  description?: string;
  headline?: string;
}

export const metadata = writable<Metadata>({});

export const serviceModelSelectionStore = writable({
  selectedService: null,
  selectedModel: null
});