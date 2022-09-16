import { env } from "$env/dynamic/public";
import PocketBase from "pocketbase";

/*
 * A separate URL for the backend is not needed if ...
 * - we are proxying to the backend via vite proxy
 * - the frontend itself is served by the backend as static files
 * ... hence the backend url of ''
 */
const url = env.BACKEND_URL || '';
export const client = new PocketBase(url);