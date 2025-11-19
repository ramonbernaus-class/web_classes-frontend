<!-- src/views/SubcategoriaView.vue -->
<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { API_URL } from '../api.js'

const route = useRoute()
const router = useRouter()
const categoriaId = Number(route.params.categoriaId)
const categoriaNombre = ref('')
const subcategorias = ref([])
const loading = ref(true)

onMounted(async () => {
  const token = localStorage.getItem("token")

  try {
    // --- CARGAR CATEGORÍA ---
    const catRes = await fetch(`${API_URL}/categorias/${categoriaId}`, {
      headers: { "Authorization": `Bearer ${token}` }
    })

    if (!catRes.ok) {
      console.error("Categoría no encontrada o token inválido")
      router.push("/login")
      return
    }

    const cat = await catRes.json()
    categoriaNombre.value = cat.nombre

    // --- CARGAR EJERCICIOS ---
    const ejRes = await fetch(`${API_URL}/ejercicios`, {
      headers: { "Authorization": `Bearer ${token}` }
    })

    if (!ejRes.ok) {
      console.error("Error cargando ejercicios (401 o fallo servidor)")
      router.push("/login")
      return
    }

    const ejercicios = await ejRes.json()

    // Validar que sea array
    if (!Array.isArray(ejercicios)) {
      throw new Error("Respuesta inválida del backend")
    }

    // --- OBTENER SUBCATEGORÍAS ---
    const subs = [...new Set(
      ejercicios
        .filter(ej => ej.categoria_id === categoriaId && ej.subcategoria)
        .map(ej => ej.subcategoria)
    )]

    subcategorias.value = subs

  } catch (err) {
    console.error("Error SubcategoriaView:", err)
    router.push("/")
  } finally {
    loading.value = false
  }
})



const irASubcategoria = (sub) => {
  router.push(`/categoria/${categoriaId}/subcategoria/${encodeURIComponent(sub)}`)
}
</script>

<template>
  <div class="subcategoria-vista">
    <button @click="router.push('/')" class="btn-volver">← Categorías</button>
    <h2 v-if="categoriaNombre">Elige tipo: {{ categoriaNombre }}</h2>
    <div v-if="loading">Cargando...</div>
    <div v-else class="subcategorias-grid">
      <div
        v-for="sub in subcategorias"
        :key="sub"
        class="subcategoria-card"
        @click="irASubcategoria(sub)"
      >
        {{ sub }}
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Usa los mismos estilos que DificultadView.vue, adaptados */
.subcategoria-vista {
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
}
.subcategorias-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 20px;
  margin-top: 16px;
}
.subcategoria-card {
  background: #5B75C1;
  color: white;
  padding: 22px 16px;
  border-radius: 14px;
  text-align: center;
  cursor: pointer;
  font-size: 1.2rem;
  font-weight: 600;
  transition: all 0.2s ease;
}
.subcategoria-card:hover {
  background: #4a63b0;
  transform: translateY(-3px);
}
</style>