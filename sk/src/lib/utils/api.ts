// src/lib/utils/api.ts
async function apiRequest<T>(
  endpoint: string,
  method: "GET" | "POST" = "GET",
  body: any = null
): Promise<T> {
  const headers = { "Content-Type": "application/json" };
  const config: RequestInit = { method, headers };

  if (body) {
    config.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(endpoint, config);
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Request failed with status ${response.status}: ${errorText}`);
    }
    return await response.json();
  } catch (error) {
    console.error("API Request failed:", error);
    throw error;
  }
}

export { apiRequest };