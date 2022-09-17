import { browser } from "$app/environment";
import PocketBase from "pocketbase";

/*
 * A separate URL for the backend is not needed if ...
 * - we are proxying to the backend via vite proxy
 * - the frontend itself is served by the backend as static files
 * ... hence the backend url of ''
 */
const url = browser ? '' : 'http://127.0.0.1:8090'
export const client = new PocketBase(url);