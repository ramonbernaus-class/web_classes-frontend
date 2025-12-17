<template>
  <div class="max-w-7xl mx-auto">
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-2xl font-semibold text-gray-900">Dashboard</h1>
        <p class="text-sm text-gray-500">Resumen rápido del sistema</p>
      </div>

      <div class="flex items-center gap-3">
        <button
          @click="goTo('usuarios')"
          class="px-3 py-2 bg-gray-800 text-white rounded-md text-sm hover:bg-gray-700"
        >Usuarios</button>

        <button
          @click="goTo('ejercicios')"
          class="px-3 py-2 bg-gray-800 text-white rounded-md text-sm hover:bg-gray-700"
        >Ejercicios</button>

        <button
          @click="goTo('entregas')"
          class="px-3 py-2 bg-gray-800 text-white rounded-md text-sm hover:bg-gray-700"
        >Entregas</button>

        <button
          @click="goTo('estadisticas')"
          class="px-3 py-2 border border-gray-300 rounded-md text-sm hover:bg-gray-50"
        >Estadísticas</button>
      </div>
    </div>

    <!-- Keep-alive control -->
    <div class="mb-6 flex items-center gap-4">
      <div class="flex items-center gap-3">
        <button
          :disabled="keepAliveActive"
          @click="startKeepAlive"
          class="px-4 py-2 rounded-md bg-green-600 text-white hover:bg-green-500 disabled:opacity-60"
        >
          Mantener servidor activo 1h
        </button>

        <button
          v-if="keepAliveActive"
          @click="stopKeepAlive"
          class="px-3 py-2 rounded-md bg-red-500 text-white hover:bg-red-400"
        >
          Cancelar
        </button>

        <div v-if="keepAliveActive" class="text-sm text-gray-600">
          Tiempo restante: <strong>{{ formattedRemaining }}</strong>
        </div>
      </div>

      <div v-if="keepAliveMessage" class="text-sm text-gray-700">
        {{ keepAliveMessage }}
      </div>
    </div>

    <!-- Metric cards -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
      <div class="bg-white border rounded-lg p-5 shadow-sm">
        <div class="text-xs text-gray-500">Usuarios</div>
        <div class="mt-2 text-3xl font-bold text-gray-900">{{ stats.usuarios }}</div>
        <div class="mt-1 text-sm text-gray-500">Admins: {{ stats.admins }} • Alumnos: {{ stats.alumnos }}</div>
      </div>

      <div class="bg-white border rounded-lg p-5 shadow-sm">
        <div class="text-xs text-gray-500">Contenido</div>
        <div class="mt-2 text-3xl font-bold text-gray-900">{{ stats.categorias }} categorías</div>
        <div class="mt-1 text-sm text-gray-500">{{ stats.ejercicios }} ejercicios</div>
      </div>

      <div class="bg-white border rounded-lg p-5 shadow-sm">
        <div class="text-xs text-gray-500">Actividad</div>
        <div class="mt-2 text-3xl font-bold text-gray-900">{{ stats.entregas }}</div>
        <div class="mt-1 text-sm text-gray-500">Entregas totales</div>
      </div>
    </div>

    <!-- Últimas entregas -->
    <div class="bg-white border rounded-lg shadow-sm p-4">
      <div class="flex items-center justify-between mb-3">
        <h2 class="text-lg font-medium text-gray-900">Últimas entregas</h2>
        <div>
          <button @click="refresh" class="text-sm px-3 py-1 border rounded-md hover:bg-gray-50">Actualizar</button>
        </div>
      </div>

      <div v-if="loading" class="py-6 text-center text-gray-500">Cargando...</div>

      <table v-else class="w-full table-auto">
        <thead>
          <tr class="text-left text-sm text-gray-600 border-b">
            <th class="py-2">Usuario</th>
            <th class="py-2">Ejercicio</th>
            <th class="py-2">Fecha</th>
            <th class="py-2">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="stats.ultimas_entregas.length === 0">
            <td colspan="4" class="py-6 text-center text-gray-500">No hay entregas recientes.</td>
          </tr>

          <tr v-for="ent in stats.ultimas_entregas" :key="ent.id" class="hover:bg-gray-50">
            <td class="py-3 text-sm text-gray-700">{{ ent.usuario }}</td>
            <td class="py-3 text-sm text-gray-700">{{ ent.ejercicio }}</td>
            <td class="py-3 text-sm text-gray-500">{{ formatDate(ent.fecha_envio) }}</td>
            <td class="py-3 text-sm">
              <button @click="verEntrega(ent.id)" class="px-2 py-1 text-sm border rounded">Ver</button>
            </td>
          </tr>
        </tbody>
      </table>

    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { API_URL } from '../../api.js' // ajusta la ruta si tu api.js está en otra ruta

const router = useRouter()

const loading = ref(false)
const stats = ref({
  usuarios: 0,
  admins: 0,
  alumnos: 0,
  categorias: 0,
  ejercicios: 0,
  entregas: 0,
  ultimas_entregas: []
})

// KEEP-ALIVE
let intervalId = null
const keepAliveActive = ref(false)
const keepAliveEnd = ref(null)
const keepAliveMessage = ref('')

// Duración en ms (1 hora)
const KEEP_ALIVE_DURATION = 60 * 60 * 1000
// Intervalo recomendado: cada 2 minutos
const PING_INTERVAL = 120000

const formattedRemaining = computed(() => {
  if (!keepAliveActive.value || !keepAliveEnd.value) return '00:00:00'
  const diff = Math.max(0, keepAliveEnd.value - Date.now())
  const hrs = Math.floor(diff / (3600 * 1000))
  const mins = Math.floor((diff % (3600 * 1000)) / (60 * 1000))
  const secs = Math.floor((diff % (60 * 1000)) / 1000)
  return `${String(hrs).padStart(2,'0')}:${String(mins).padStart(2,'0')}:${String(secs).padStart(2,'0')}`
})

function getToken() {
  return localStorage.getItem('token')
}

async function fetchStats() {
  loading.value = true
  try {
    const res = await fetch(`${API_URL}/admin/estadisticas`, {
      headers: { Authorization: `Bearer ${getToken()}` }
    })
    if (!res.ok) throw new Error('No autorizado')
    const json = await res.json()
    stats.value = json
  } catch (err) {
    console.error('Error cargando estadísticas', err)
    // opcional: redirigir al login si 401
    if (err.message === 'No autorizado') {
      router.push('/login')
    }
  } finally {
    loading.value = false
  }
}

function formatDate(d) {
  try {
    return new Date(d).toLocaleString()
  } catch {
    return d
  }
}

function goTo(section) {
  router.push(`/admin/${section}`)
}

function verEntrega(id) {
  // Navega a la vista de entrega o abre modal (implementa según tu estructura)
  router.push(`/admin/entregas?ver=${id}`)
}

function refresh() {
  fetchStats()
}

// KEEP-ALIVE functions
async function ping() {
  try {
    await fetch(`${API_URL}/api/ping`)
    // Puedes mostrar logs si quieres
    // console.log('Ping enviado')
  } catch (err) {
    console.error('Error enviando ping', err)
  }
}

function startKeepAlive() {
  if (keepAliveActive.value) return
  keepAliveActive.value = true
  keepAliveEnd.value = Date.now() + KEEP_ALIVE_DURATION
  keepAliveMessage.value = 'Keep-alive activo'
  // ping inicial para despertar inmediatamente
  ping()
  // intervalo repetido
  intervalId = setInterval(() => {
    // si tiempo terminado, detenemos
    if (Date.now() >= keepAliveEnd.value) {
      stopKeepAlive()
      return
    }
    ping()
  }, PING_INTERVAL)
  // actualizar contador cada segundo para UI
  tickCountdown()
  // guardamos info en localStorage para mantener estado si recargas
  localStorage.setItem('keepAliveEnd', String(keepAliveEnd.value))
}

function stopKeepAlive() {
  keepAliveActive.value = false
  keepAliveEnd.value = null
  keepAliveMessage.value = 'Keep-alive detenido'
  if (intervalId) {
    clearInterval(intervalId)
    intervalId = null
  }
  localStorage.removeItem('keepAliveEnd')
}

function tickCountdown() {
  // actualiza el UI y comprueba finalización
  const timer = setInterval(() => {
    if (!keepAliveActive.value) {
      clearInterval(timer)
      return
    }
    if (Date.now() >= keepAliveEnd.value) {
      stopKeepAlive()
      clearInterval(timer)
      keepAliveMessage.value = 'Keep-alive finalizado'
    }
  }, 1000)
}

// On mount, recuperar estado y cargar datos
onMounted(() => {
  const stored = localStorage.getItem('keepAliveEnd')
  if (stored) {
    const end = Number(stored)
    if (end && end > Date.now()) {
      keepAliveActive.value = true
      keepAliveEnd.value = end
      // reestablecer intervalos
      intervalId = setInterval(() => {
        if (Date.now() >= keepAliveEnd.value) {
          stopKeepAlive()
          return
        }
        ping()
      }, PING_INTERVAL)
      tickCountdown()
    } else {
      localStorage.removeItem('keepAliveEnd')
    }
  }
  fetchStats()
})
</script>

