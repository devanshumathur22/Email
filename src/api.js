export const api = async (url, options = {}) => {
  const token = localStorage.getItem("token")

  const res = await fetch(
    `${import.meta.env.VITE_API_URL}${url}`,
    {
      method: options.method || "GET",
      body: options.body
        ? JSON.stringify(options.body)
        : undefined,
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      credentials: "include", // 🔥 add this
    }
  )

  if (!res.ok) {
    const text = await res.text()
    throw new Error(text)
  }

  return res.json()
}
