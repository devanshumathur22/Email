
export const api = async (path: string, options: any = {}) => {
    // Ensure path starts with /
    const endpoint = path.startsWith("/") ? path : `/${path}`;

    // Ensure it hits our API routes
    const url = endpoint.startsWith("/api") ? endpoint : `/api${endpoint}`;

    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

    const headers: any = {
        "Content-Type": "application/json",
        ...(options.headers || {}),
    };

    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }

    try {
        const res = await fetch(url, {
            ...options,
            headers,
        });

        // 🛡️ Handle 401 Unauthorized globally
        if (res.status === 401) {
            if (typeof window !== "undefined") {
                localStorage.removeItem("token");
                window.location.href = "/login";
                // Return empty to avoid further errors in UI if component unmounts
                return null;
            }
        }

        let data;
        const contentType = res.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
            data = await res.json();
        } else {
            // Text response or empty
            const text = await res.text();
            try {
                data = JSON.parse(text);
            } catch {
                data = { message: text || `HTTP ${res.status}` };
            }
        }

        if (!res.ok) {
            throw new Error(data.message || `Request failed (${res.status})`);
        }

        return data;

    } catch (err: any) {
        console.error("API Error:", err);
        throw err;
    }
};
