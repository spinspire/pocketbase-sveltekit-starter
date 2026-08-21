import { writable } from "svelte/store";

// Returns a store that tracks async operation state.
// Starts false, becomes true while the async function runs, then false again.
export function activityStore<T>(f: (t: T) => Promise<any>) {
  const store = writable(false);
  async function run(data: T) {
    try {
      store.set(true);
      return await f(data);
    } finally {
      store.set(false);
    }
  }
  return { ...store, run };
}
