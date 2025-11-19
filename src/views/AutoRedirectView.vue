<script setup>
import { onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { API_URL } from '../api.js' 

const route = useRoute()
const router = useRouter()
const categoriaId = Number(route.params.categoriaId)

onMounted(async () => {
  const res = await fetch(`${API_URL}/ejercicios`)
  const ejercicios = await res.json()

  const tieneSub = ejercicios.some(
    ej => ej.categoria_id === categoriaId && ej.subcategoria
  )

  if (tieneSub) {
    router.replace(`/categoria/${categoriaId}/subcategorias`)
  } else {
    router.replace(`/categoria/${categoriaId}/subcategoria/null`)
  }
})
</script>

<template>
  <div>Cargando...</div>
</template>
