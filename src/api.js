export const api = async (url, options = {}) => {
  const token = localStorage.getItem("token")

  const res = await fetch(`http://localhost:8000${url}`, {
    method: options.method || "GET",
    body:
      options.body instanceof FormData
        ? options.body
        : options.body
        ? JSON.stringify(options.body)
        : undefined,
    headers:
      options.body instanceof FormData
        ? {
            Authorization: token ? `Bearer ${token}` : "",
          }
        : {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
  })

  if (!res.ok) {
    let message = "Server error"

    try {
      const data = await res.json()
      message = data.message || message
    } catch {
      message = await res.text()
    }

    throw new Error(message)
  }

  if (res.status === 204) return null

  return res.json()
}
