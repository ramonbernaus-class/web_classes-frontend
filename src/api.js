// src/api.js
// export const API_URL = "https://web-classes-backend.onrender.com/api"
export const API_URL = import.meta.env.VITE_API_URL;

export async function apiGET(endpoint) {
  const token = localStorage.getItem("token")
  const res = await fetch(`${API_URL}${endpoint}`, {
    headers: {
      "Authorization": `Bearer ${token}`
    }
  })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export async function apiPOST(endpoint, body) {
  const token = localStorage.getItem("token")
  const res = await fetch(`${API_URL}${endpoint}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify(body)
  })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

