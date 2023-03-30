import { alerts } from "$lib/components/Alerts.svelte";

// wrapper to execute a pocketbase client request and generate alerts on failure
export async function alertOnFailure(request: () => void) {
  try {
    await request();
  } catch (e: any) {
    const {
      message,
      data: { data = {} },
    } = e;
    if (message) alerts.error(message);
    for (const key in data) {
      const { message } = data[key];
      if (message) alerts.error(`${key}: ${message}`);
    }
  }
}
