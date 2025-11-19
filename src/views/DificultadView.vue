<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { API_URL } from '../api.js'

const route = useRoute()
const router = useRouter()
const categoriaId = Number(route.params.categoriaId)
const subcategoria = route.params.subcategoria || null

const categoriaNombre = ref('')
const dificultades = ref([])
const loading = ref(true)

onMounted(async () => {
  if (!categoriaId || isNaN(categoriaId)) {
    router.push('/')
    return 
  }

  try {
    const catRes = await fetch(`${API_URL}/categorias/${categoriaId}`)
    if (!catRes.ok) throw new Error('Categoría no encontrada')
    const cat = await catRes.json()
    categoriaNombre.value = cat.nombre

    const ejRes = await fetch(`${API_URL}/ejercicios`)
    const ejercicios = await ejRes.json()

    const ejDeCategoria = ejercicios.filter(ej => {
      if (subcategoria && subcategoria !== 'null') {
        return ej.categoria_id === categoriaId && ej.subcategoria === subcategoria
      } else {
        return ej.categoria_id === categoriaId && (!ej.subcategoria || ej.subcategoria === null)
      }
    })

    const difs = [...new Set(ejDeCategoria.map(ej => ej.dificultad).filter(Boolean))]
    dificultades.value = difs.sort((a, b) => {
      const orden = { 'fácil': 1, 'media': 2, 'difícil': 3 }
      return (orden[a] || 99) - (orden[b] || 99)
    })
  } catch (err) {
    console.error('Error:', err)
    router.push('/')
  } finally {
    loading.value = false
  }
})

const irADificultad = (nivel) => {
  const sub = subcategoria || 'null'
  router.push(`/categoria/${categoriaId}/subcategoria/${encodeURIComponent(sub)}/dificultad/${encodeURIComponent(nivel)}`)
}

</script>

<template>
  <div class="dificultad-vista">
    <button @click="router.push('/')" class="btn-volver">← Categorías</button>
    <h2 v-if="categoriaNombre">Selecciona dificultad: {{ categoriaNombre }}</h2>
    <div v-if="loading">Cargando niveles...</div>
    <div v-else class="dificultades-grid">
      <div
        v-for="nivel in dificultades"
        :key="nivel"
        class="dificultad-card"
        @click="irADificultad(nivel)"
        role="button"
        tabindex="0"
      >
        {{ nivel.charAt(0).toUpperCase() + nivel.slice(1) }}
      </div>
    </div>
  </div>
</template>

<style scoped>
.dificultad-vista {
  padding: 32px 24px;
  max-width: 720px;
  margin: 0 auto;
  font-family: 'Segoe UI', system-ui, sans-serif;
}

.btn-volver {
  background: #f8f6ff;
  color: #8A48E0;
  border: 1px solid #e0d7f5;
  padding: 8px 16px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  margin-bottom: 28px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s ease;
}

.btn-volver:hover {
  background: #efe6ff;
  border-color: #d0c0f0;
}

.dificultad-vista h2 {
  color: #0A2283;
  font-weight: 700;
  margin-bottom: 28px;
  font-size: 1.5rem;
  text-align: center;
}

.dificultades-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 20px;
  margin-top: 16px;
}

.dificultad-card {
  background: #8A48E0;
  color: white;
  padding: 22px 16px;
  border-radius: 14px;
  text-align: center;
  cursor: pointer;
  font-size: 1.2rem;
  font-weight: 600;
  transition: all 0.2s ease;
  box-shadow: 0 4px 12px rgba(138, 72, 224, 0.3);
}

.dificultad-card:hover {
  background: #7a3ed5;
  transform: translateY(-3px);
  box-shadow: 0 6px 16px rgba(138, 72, 224, 0.4);
}

.loading {
  text-align: center;
  color: #5a4a7a;
  font-size: 1.1rem;
  margin-top: 32px;
}

@media (max-width: 600px) {
  .dificultades-grid {
    grid-template-columns: 1fr;
  }
}
</style>
