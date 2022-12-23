import { browser } from "$app/environment";
import PocketBase, { Admin, BaseModel, Record } from "pocketbase";
import { writable } from "svelte/store";

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
