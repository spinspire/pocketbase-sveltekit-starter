// lib/stores/postsStore.ts
import { writable } from 'svelte/store';
import type { PostsResponse } from '$lib/pocketbase/generated-types';

export const postsStore = writable<PostsResponse[]>([]);