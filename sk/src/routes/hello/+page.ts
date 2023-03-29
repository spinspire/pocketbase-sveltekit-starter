import type { PageLoad } from "./$types";

export const load: PageLoad = async function ({ fetch }) {
  const response = await fetch("/api/hello");
  const json = await response.json();
  return {
    ...json,
  };
};
