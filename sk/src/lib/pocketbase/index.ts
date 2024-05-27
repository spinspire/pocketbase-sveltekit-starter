import PocketBase, { type AuthProviderInfo, RecordService } from "pocketbase";
import type {
  AdminModel,
  AuthModel,
  ListResult,
  RecordListOptions,
  RecordModel,
  UnsubscribeFunc,
} from "pocketbase";
import { readable, type Readable, type Subscriber } from "svelte/store";
import { browser } from "$app/environment";
import { base } from "$app/paths";
import { invalidateAll } from "$app/navigation";

export const client = new PocketBase(
  browser ? window.location.origin + base : undefined
);

export const authModel = readable<AuthModel | AdminModel | null>(
  null,
  function (set, update) {
    client.authStore.onChange((token, model) => {
      update((oldval) => {
        if (
          (oldval?.isValid && !model?.isValid) ||
          (!oldval?.isValid && model?.isValid)
        ) {
          // if the auth changed, invalidate all page load data
          invalidateAll();
        }
        return model;
      });
    }, true);
  }
);

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
export async function save<T>(collection: string, record: any, create = false) {
  // convert obj to FormData in case one of the fields is instanceof FileList
  const data = object2formdata(record);
  if (record.id && !create) {
    // "create" flag overrides update
    return await client.collection(collection).update<T>(record.id, data);
  } else {
    return await client.collection(collection).create<T>(data);
  }
}

// convert obj to FormData in case one of the fields is instanceof FileList
function object2formdata(obj: {}) {
  // check if any field's value is an instanceof FileList
  if (
    !Object.values(obj).some(
      (val) => val instanceof FileList || val instanceof File
    )
  ) {
    // if not, just return the original object
    return obj;
  }
  // otherwise, build FormData (multipart/form-data) from obj
  const fd = new FormData();
  for (const [key, val] of Object.entries(obj)) {
    if (val instanceof FileList) {
      for (const file of val) {
        fd.append(key, file);
      }
    } else if (val instanceof File) {
      // handle File before "object" so that it doesn't get serialized as JSON
      fd.append(key, val);
    } else if (Array.isArray(val)) {
      // for some reason, multipart/form-data wants arrays to be comma-separated strings
      fd.append(key, val.join(","));
    } else if (typeof val === "object") {
      fd.append(key, JSON.stringify(val));
    } else {
      fd.append(key, val as any);
    }
  }
  return fd;
}

export interface PageStore<T = any> extends Readable<ListResult<T>> {
  setPage(newpage: number): Promise<void>;
  next(): Promise<void>;
  prev(): Promise<void>;
}

export async function watch<T extends RecordModel>(
  idOrName: string,
  queryParams = {} as RecordListOptions,
  page = 1,
  perPage = 20,
  realtime = browser
): Promise<PageStore<T>> {
  const collection = client.collection(idOrName);
  let result = await collection.getList<T>(page, perPage, queryParams);
  let set: Subscriber<ListResult<T>>;
  let unsubRealtime: UnsubscribeFunc | undefined;
  // fetch first page
  const store = readable<ListResult<T>>(result, (_set) => {
    set = _set;
    // watch for changes (only if you're in the browser)
    if (realtime)
      collection
        .subscribe<T>(
          "*",
          ({ action, record }) => {
            (async function (action: string) {
              // see https://github.com/pocketbase/pocketbase/discussions/505
              switch (action) {
                // ISSUE: no subscribe event when a record is modified and no longer fits the "filter"
                // @see https://github.com/pocketbase/pocketbase/issues/4717
                case "update":
                case "create":
                  // record = await expand(queryParams.expand, record);
                  const index = result.items.findIndex(
                    (r) => r.id === record.id
                  );
                  // replace existing if found, otherwise append
                  if (index >= 0) {
                    result.items[index] = record;
                    return result.items;
                  } else {
                    return [...result.items, record];
                  }
                case "delete":
                  return result.items.filter((item) => item.id !== record.id);
              }
              return result.items;
            })(action).then((items) => set((result = { ...result, items })));
          },
          queryParams
        )
        // remember for later
        .then((unsub) => (unsubRealtime = unsub));
  });
  async function setPage(newpage: number) {
    const { page, totalPages, perPage } = result;
    if (page > 0 && page <= totalPages) {
      set((result = await collection.getList(newpage, perPage, queryParams)));
    }
  }
  return {
    ...store,
    subscribe(run, invalidate) {
      const unsubStore = store.subscribe(run, invalidate);
      return async () => {
        unsubStore();
        // ISSUE: Technically, we should AWAIT here, but that will slow down navigation UX.
        if (unsubRealtime) /* await */ unsubRealtime();
      };
    },
    setPage,
    async next() {
      setPage(result.page + 1);
    },
    async prev() {
      setPage(result.page - 1);
    },
  };
}

export async function providerLogin(
  provider: AuthProviderInfo,
  authCollection: RecordService
) {
  const authResponse = await authCollection.authWithOAuth2({
    provider: provider.name,
    createData: {
      // emailVisibility: true,
    },
  });
  // update user "record" if "meta" has info it doesn't have
  const { meta, record } = authResponse;
  let changes = {} as { [key: string]: any };
  if (!record.name && meta?.name) {
    changes.name = meta.name;
  }
  if (!record.avatar && meta?.avatarUrl) {
    const response = await fetch(meta.avatarUrl);
    if (response.ok) {
      const type = response.headers.get("content-type") ?? "image/jpeg";
      changes.avatar = new File([await response.blob()], "avatar", { type });
    }
  }
  if (Object.keys(changes).length) {
    authResponse.record = await save(authCollection.collectionIdOrName, {
      ...record,
      ...changes,
    });
  }
  return authResponse;
}
