import { writable } from "svelte/store";

export interface Metadata {
  title?: string;
  description?: string;
  headline?: string;
}

export const metadata = writable<Metadata>({});
