// src/api.js
import router from "@/router"

export const API_URL = import.meta.env.VITE_API_URL;

async function handleResponse(res) {
  if (res.status === 401) {
    // Token inválido o expirado
    localStorage.removeItem("token")
    localStorage.removeItem("usuario")
    router.push("/login")
    return
  }

  if (!res.ok) {
    throw new Error(await res.text())
  }

  return res.json()
}

export async function apiGET(endpoint) {
  const token = localStorage.getItem("token")

  const res = await fetch(`${API_URL}${endpoint}`, {
    headers: {
      "Authorization": `Bearer ${token}`
    }
  })

  return handleResponse(res)
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

  return handleResponse(res)
}

