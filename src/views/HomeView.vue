<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { API_URL } from '../api.js'

const categorias = ref([])
const loading = ref(true)
const error = ref(false)
const usuario = ref(null)
const router = useRouter()

// 🔹 Cargar usuario logueado desde localStorage
const cargarUsuario = () => {
  const data = localStorage.getItem('usuario')
  if (data) usuario.value = JSON.parse(data)
}

// 🔹 Cargar categorías desde el backend
const cargarCategorias = async () => {
  try {
    const res = await fetch(`${API_URL}/categorias`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    })
    if (!res.ok) throw new Error('Error al cargar categorías')
    const data = await res.json()
    console.log('📦 Categorías recibidas:', data)
    categorias.value = data
  } catch (err) {
    console.error('❌ Error cargando categorías:', err)
    error.value = true
  } finally {
    loading.value = false
  }
}

// 🔹 Navegar a una categoría
const irACategoria = (id) => {
  router.push(`/categoria/${id}`)
}

// 🔹 Cerrar sesión
const logout = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('usuario')
  router.push('/login')
}

onMounted(() => {
  cargarUsuario()
  cargarCategorias()
})
</script>

<template>
  <div class="home">
    <div class="header">
      <h1>📚 Classes Programació</h1>

      <div v-if="usuario" class="usuario-info">
        👋 Benvingut, <strong>{{ usuario.nombre }}</strong>
        <button class="logout-btn" @click="logout">Tancar sessió</button>
      </div>

      <div v-else class="login-btn-container">
        <button class="login-btn" @click="router.push('/login')">
          Iniciar sessió
        </button>
      </div>
    </div>

    <RouterLink to="/entrega">
      <button>Enviar exercici</button>
    </RouterLink>

    <p>Tria una opció:</p>

    <div v-if="loading">Cargando categorías...</div>
    <div v-else-if="error">Error al cargar las categorías</div>

    <div v-else class="categorias-grid">
      <div
        v-for="cat in categorias"
        :key="cat.id"
        class="categoria-card"
        @click="irACategoria(cat.id)"
      >
        {{ cat.nombre }}
      </div>
    </div>
  </div>
</template>

<style scoped>
.home {
  padding: 32px 24px;
  max-width: 900px;
  margin: 0 auto;
  font-family: 'Segoe UI', system-ui, sans-serif;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
}

.usuario-info {
  font-size: 1rem;
  color: #0A2283;
}

.logout-btn {
  background: #e74c3c;
  color: white;
  border: none;
  margin-left: 10px;
  padding: 6px 12px;
  border-radius: 8px;
  cursor: pointer;
}

.login-btn-container {
  text-align: right;
}

.login-btn {
  background: #8A48E0;
  color: white;
  border: none;
  padding: 8px 14px;
  border-radius: 8px;
  cursor: pointer;
}

.home h1 {
  color: #0A2283;
  font-weight: 800;
  margin-bottom: 20px;
  font-size: 2rem;
}

.home p {
  color: #0A2283;
  font-weight: 450;
  font-size: 1.3rem;
  margin-top: 20px;
}

.categorias-grid {
  margin-top: 30px;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 20px;
}

.categoria-card {
  background: white;
  border: 2px solid #eae6f5;
  border-radius: 14px;
  padding: 24px 20px;
  text-align: center;
  cursor: pointer;
  transition: all 0.25s ease;
  box-shadow: 0 3px 10px rgba(10, 34, 131, 0.06);
  color: #0A2283;
  font-weight: 600;
  font-size: 1.1rem;
}

.categoria-card:hover {
  transform: translateY(-4px);
  border-color: #8A48E0;
  box-shadow: 0 6px 16px rgba(138, 72, 224, 0.2);
  background: #f9f6ff;
}

.loading, .error {
  text-align: center;
  padding: 24px;
  color: #5a4a7a;
  font-size: 1.1rem;
}

@media (max-width: 600px) {
  .categorias-grid {
    grid-template-columns: 1fr;
  }
  .home h1 {
    font-size: 1.6rem;
  }
}
</style>
