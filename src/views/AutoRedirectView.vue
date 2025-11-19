<script setup>
import { onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { API_URL } from '../api.js' 

const route = useRoute()
const router = useRouter()
const categoriaId = Number(route.params.categoriaId)

onMounted(async () => { 
  const token = localStorage.getItem("token")

  try {
    const res = await fetch(`${API_URL}/ejercicios`, {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    })

    if (!res.ok) {
      console.error("No autorizado o error cargando ejercicios")
      router.push("/login")
      return
    }

    const ejercicios = await res.json()

    // Validar que realmente es un array
    if (!Array.isArray(ejercicios)) {
      throw new Error("Respuesta inválida del servidor")
    }

    const tieneSub = ejercicios.some(
      ej => ej.categoria_id === categoriaId && ej.subcategoria
    )

    if (tieneSub) {
      router.replace(`/categoria/${categoriaId}/subcategorias`)
    } else {
      router.replace(`/categoria/${categoriaId}/subcategoria/null`)
    }

  } catch (err) {
    console.error("Error:", err)
    router.push("/")
  }
})

</script>

<template>
  <div>Cargando...</div>
</template>
