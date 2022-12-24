import { browser } from "$app/environment";
import PocketBase, { ListResult } from "pocketbase";
import {
  readable,
  writable,
  type Readable,
  type Subscriber,
} from "svelte/store";

/*
 * A separate URL for the backend is not needed if ...
 * - we are proxying to the backend via vite proxy
 * - the frontend itself is served by the backend as static files
 * ... hence the backend url of ''
 */
const url = browser ? "" : "http://127.0.0.1:8090";
export const client = new PocketBase(url);

client.authStore.onChange(function () {
  currentUser.set(client.authStore.model);
});

export const currentUser = writable(client.authStore.model);

export async function login(
  email: string,
  password: string,
  register = false,
  rest: { [key: string]: any } = {}
) {
  if (register) {
    const user = { ...rest, email, password, confirmPassword: password };
    await client.collection("users").create(user);
  }
  await client.collection("users").authWithPassword(email, password);
}

export function logout() {
  client.authStore.clear();
}

export interface PageStore extends Readable<ListResult<Record<any, any>>> {
  setPage(newpage: number): Promise<void>;
  next(): Promise<void>;
  prev(): Promise<void>;
}

// realtime subscription on a collection, with pagination
export function watch(
  idOrName: string,
  queryParams = {} as any,
  page = 1,
  perPage = 20
): PageStore {
  const collection = client.collection(idOrName);
  let result = new ListResult(page, perPage, 0, 0, [] as Record<any, any>[]);
  let set: Subscriber<ListResult<Record<any, any>>>;
  const store = readable(result, (_set) => {
    set = _set;
    // fetch first page
    collection
      .getList(page, perPage, queryParams)
      .then((r) => set((result = r)));
    // watch for changes (only if you're in the browser)
    if (browser)
      collection.subscribe("*", ({ action, record }) => {
        (async function (action: string) {
          // see https://github.com/pocketbase/pocketbase/discussions/505
          async function expand(expand: any, record: any) {
            return expand
              ? await collection.getOne(record.id, { expand })
              : record;
          }
          switch (action) {
            case "update":
              record = await expand(queryParams.expand, record);
              return result.items.map((item) =>
                item.id === record.id ? record : item
              );
            case "create":
              record = await expand(queryParams.expand, record);
              return [...result.items, record];
            case "delete":
              return result.items.filter((item) => item.id !== record.id);
          }
          return result.items;
        })(action).then((items) => set((result = { ...result, items })));
      });
  });
  async function setPage(newpage: number) {
    const { page, totalPages, perPage } = result;
    if (page > 0 && page <= totalPages) {
      set((result = await collection.getList(newpage, perPage, queryParams)));
    }
  }
  return {
    ...store,
    setPage,
    async next() {
      setPage(result.page + 1);
    },
    async prev() {
      setPage(result.page - 1);
    },
  };
}
