import { writable } from "svelte/store";

type Theme = "theme-light" | "theme-dark";

function createThemeStore() {
  const initialValue: Theme =
    (localStorage.getItem("theme") as Theme) || "theme-light";
  const store = writable<Theme>(initialValue);

  store.subscribe((value) => {
    localStorage.setItem("theme", value);
  });

  return store;
}

export const theme = createThemeStore();