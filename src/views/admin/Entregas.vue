<template>
  <div class="max-w-6xl mx-auto">
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-2xl font-semibold">Entregas</h1>
        <p class="text-sm text-gray-500">Lista de entregas recientes y revisión de código</p>
      </div>

      <div class="flex gap-2">
        <button @click="cargar" class="px-3 py-2 border rounded-md">Recargar</button>
        <button @click="limpiarFiltro" class="px-3 py-2 border rounded-md">Limpiar filtro</button>
      </div>
    </div>

    <!-- filtros -->
    <div class="mb-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
      <input v-model="q" @input="filtrarLocal" placeholder="Buscar por usuario o ejercicio..." class="px-3 py-2 border rounded" />
      <select v-model="filtro.categoria" @change="filtrarLocal" class="px-3 py-2 border rounded">
        <option value="">Todas las categorías</option>
        <option v-for="c in categorias" :key="c.id" :value="c.id">{{ c.nombre }}</option>
      </select>
      <select v-model="filtro.revisada" @change="filtrarLocal" class="px-3 py-2 border rounded">
        <option value="">Todas</option>
        <option value="si">Revisadas</option>
        <option value="no">Sin revisar</option>
      </select>
    </div>

    <div class="bg-white border rounded shadow-sm overflow-auto">
      <table class="min-w-full">
        <thead class="bg-gray-100 text-left text-sm text-gray-700">
          <tr>
            <th class="px-3 py-2">ID</th>
            <th class="px-3 py-2">Usuario</th>
            <th class="px-3 py-2">Ejercicio</th>
            <th class="px-3 py-2">Fecha</th>
            <th class="px-3 py-2">Revisada</th>
            <th class="px-3 py-2">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="filtered.length === 0">
            <td colspan="6" class="py-6 text-center text-gray-500">No hay entregas.</td>
          </tr>
          <tr v-for="e in filtered" :key="e.id" class="border-b hover:bg-gray-50">
            <td class="px-3 py-2 text-sm">{{ e.id }}</td>
            <td class="px-3 py-2 text-sm">{{ e.usuario }}</td>
            <td class="px-3 py-2 text-sm">{{ e.ejercicio }}</td>
            <td class="px-3 py-2 text-sm">{{ formatDate(e.fecha_envio) }}</td>
            <td class="px-3 py-2 text-sm">{{ e.revisada ? 'Sí' : 'No' }}</td>
            <td class="px-3 py-2 text-sm">
              <button @click="ver(e)" class="text-blue-600 hover:underline mr-2">Ver</button>
              <button @click="marcarRevisada(e)" class="text-green-600 hover:underline mr-2">Marcar revisada</button>
              <button @click="borrar(e)" class="text-red-600 hover:underline">Borrar</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- modal ver entrega -->
    <div v-if="modalVisible" class="fixed inset-0 bg-black bg-opacity-40 flex items-start justify-center p-6 z-50">
      <div class="bg-white rounded-lg shadow-lg w-full max-w-3xl overflow-auto">
        <div class="p-4 border-b flex justify-between items-center">
          <div>
            <h2 class="text-lg font-semibold">Entrega #{{ selected.id }}</h2>
            <p class="text-sm text-gray-600">{{ selected.usuario }} — {{ selected.ejercicio }} — {{ formatDate(selected.fecha_envio) }}</p>
          </div>
          <button @click="cerrarModal" class="px-3 py-1">Cerrar</button>
        </div>

        <div class="p-4">
          <h3 class="font-medium mb-2">Código enviado</h3>
          <pre class="bg-gray-100 p-3 rounded overflow-auto text-sm"><code>{{ selected.codigo }}</code></pre>

          <div class="mt-4 flex gap-3">
            <button @click="marcarRevisada(selected)" class="px-3 py-2 bg-green-600 text-white rounded">Marcar revisada</button>
            <button @click="cerrarModal" class="px-3 py-2 border rounded">Cerrar</button>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { API_URL } from '../../api.js'

const entregas = ref([])
const categorias = ref([])
const loading = ref(false)
const q = ref('')
const filtro = ref({ categoria: '', revisada: '' })

const modalVisible = ref(false)
const selected = ref(null)

function getToken() { return localStorage.getItem('token') }

function formatDate(d) {
  try { return new Date(d).toLocaleString() } catch { return d }
}

// cargar entregas (ajusta endpoint si cambió)
async function cargar() {
  loading.value = true
  try {
    const res = await fetch(`${API_URL}/api/entregas`, {
      headers: { Authorization: `Bearer ${getToken()}` }
    })
    if (!res.ok) throw new Error('no autorizado')
    // tu endpoint devuelve lista con usuario.text etc
    entregas.value = await res.json()
    // añadimos campos opcionales en frontend (revisada)
    entregas.value = entregas.value.map(e => ({ ...e, revisada: e.resultado ? true : false }))
  } catch (err) {
    console.error(err)
    alert('Error cargando entregas')
  } finally {
    loading.value = false
  }
}

const filtered = computed(() => {
  return entregas.value.filter(e => {
    if (q.value) {
      const s = (e.usuario + ' ' + e.ejercicio).toLowerCase()
      if (!s.includes(q.value.toLowerCase())) return false
    }
    if (filtro.value.categoria && Number(filtro.value.categoria) !== Number(e.categoria_id)) return false
    if (filtro.value.revisada) {
      if (filtro.value.revisada === 'si' && !e.revisada) return false
      if (filtro.value.revisada === 'no' && e.revisada) return false
    }
    return true
  })
})

function filtrarLocal() { /* computed actualiza */ }

function limpiarFiltro() {
  q.value = ''
  filtro.value = { categoria: '', revisada: '' }
}

function ver(e) {
  selected.value = e
  modalVisible.value = true
}

function cerrarModal() {
  modalVisible.value = false
  selected.value = null
}

async function marcarRevisada(e) {
  // Si tu backend tiene endpoint para marcar resultado, úsalo. Si no, simplemente simulamos.
  try {
    // ejemplo: PUT /api/admin/entregas/{id} { resultado: "revisado" }
    const res = await fetch(`${API_URL}/api/admin/entregas/${e.id}/revisar`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
      body: JSON.stringify({ resultado: 'revisado' })
    })
    if (!res.ok) {
      // si endpoint no existe, actualizamos localmente
      e.revisada = true
    } else {
      e.revisada = true
    }
    alert('Marcada como revisada')
  } catch (err) {
    console.error(err)
    e.revisada = true
    alert('Marcada (modo local)')
  }
}

async function borrar(e) {
  if (!confirm('Borrar entrega?')) return
  try {
    const res = await fetch(`${API_URL}/api/admin/entregas/${e.id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${getToken()}` }
    })
    if (!res.ok) throw new Error('error')
    cargar()
  } catch (err) {
    console.error(err)
    alert('Error borrando (o endpoint no existe)')
  }
}

onMounted(() => {
  // cargar categorías para filtro (si tu endpoint exige token, añade headers)
  fetch(`${API_URL}/api/categorias`).then(r=>r.json()).then(j=>categorias.value=j).catch(()=>{})
  cargar()
})
</script>
