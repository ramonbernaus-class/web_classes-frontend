<script setup>
import { onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const categoriaId = Number(route.params.categoriaId)

onMounted(async () => {
  const res = await fetch('/api/ejercicios')
  const ejercicios = await res.json()

  // Busca si hay ejercicios con subcategoria definida
  const tieneSub = ejercicios.some(
    ej => ej.categoria_id === categoriaId && ej.subcategoria
  )

  if (tieneSub) {
    router.replace(`/categoria/${categoriaId}/subcategorias`)
  } else {
    // Si no hay subcategoría, redirige a "null" que luego DificultadView entiende
    router.replace(`/categoria/${categoriaId}/subcategoria/null`)
  }
})
</script>

<template>
  <div>Cargando...</div>
</template>
