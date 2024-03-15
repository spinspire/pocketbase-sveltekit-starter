// src/lib/api.ts
async function apiRequest(endpoint: string, method: "GET" | "POST" = "GET", body: any = null) {
    const headers = { "Content-Type": "application/json" };
    const config: RequestInit = { method, headers };

    if (body) {
        config.body = JSON.stringify(body);
    }

    try {
        const response = await fetch(endpoint, config);
        if (!response.ok) throw new Error(await response.text());
        return await response.json();
    } catch (error) {
        console.error("API Request failed:", error);
        throw error;
    }
}

export { apiRequest };
