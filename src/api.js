console.log("API URL:", import.meta.env.VITE_API_URL)

export const api = async (url, options = {}) => {
  const token = localStorage.getItem("token")

  const res = await fetch(
    `${import.meta.env.VITE_API_URL}${url}`,
    {
      method: options.method || "GET",
      body: options.body ? JSON.stringify(options.body) : undefined,
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      credentials: "include",
    }
  )

  const contentType = res.headers.get("content-type")

  if (!res.ok) {
    const text = await res.text()
    throw new Error(text)
  }

  if (!contentType?.includes("application/json")) {
    const text = await res.text()
    throw new Error("Expected JSON, got:\n" + text)
  }
  const BASE = import.meta.env.VITE_API_URL

console.log("BASE:", BASE)

if (!BASE) {
  throw new Error("VITE_API_URL missing")
}


  return res.json()
}
