import { browser } from "$app/environment";
import PocketBase, { ListResult } from "pocketbase";
import {
  readable,
  writable,
  type Readable,
  type Subscriber,
} from "svelte/store";
import type { BaseSystemFields } from "./generated-types";

export const client = new PocketBase();

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

/*
 * Save (create/update) a record (a plain object). Automatically converts to
 * FormData if needed.
 */
export async function save(collection: string, record: any) {
  // convert obj to FormData in case one of the fields is instanceof FileList
  const data = object2formdata(record);
  if (record.id) {
    return await client.collection(collection).update(record.id, data);
  } else {
    return await client.collection(collection).create(data);
  }
}

// convert obj to FormData in case one of the fields is instanceof FileList
function object2formdata(obj: {}) {
  // check if any field's value is an instanceof FileList
  if (!Object.values(obj).some((val) => val instanceof FileList)) {
    // if not, just return the original object
    return obj;
  }
  // otherwise, build FormData from obj
  const fd = new FormData();
  for (const [key, val] of Object.entries(obj)) {
    if (val instanceof FileList) {
      for (const file of val) {
        fd.append(key, file);
      }
    } else {
      fd.append(key, val as any);
    }
  }
  return fd;
}

export interface PageStore<T extends Record<any, any>>
  extends Readable<ListResult<T>> {
  setPage(newpage: number): Promise<void>;
  next(): Promise<void>;
  prev(): Promise<void>;
}

// realtime subscription on a collection, with pagination
export function watch<T extends Record<any, any> & BaseSystemFields>(
  idOrName: string,
  queryParams = {} as any,
  page = 1,
  perPage = 20
): PageStore<T> {
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
