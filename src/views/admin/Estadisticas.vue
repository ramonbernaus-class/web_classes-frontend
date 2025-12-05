<template>
  <div class="max-w-6xl mx-auto">
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-semibold">Estadísticas</h1>
      <button @click="cargar" class="px-3 py-2 border rounded">Actualizar</button>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div class="bg-white p-4 rounded shadow">
        <h2 class="text-sm text-gray-600 mb-2">Usuarios</h2>
        <div class="text-3xl font-bold">{{ stats.usuarios }}</div>
        <div class="text-sm text-gray-500">Admins: {{ stats.admins }} • Alumnos: {{ stats.alumnos }}</div>
      </div>

      <div class="bg-white p-4 rounded shadow">
        <h2 class="text-sm text-gray-600 mb-2">Contenido</h2>
        <div class="text-3xl font-bold">{{ stats.ejercicios }}</div>
        <div class="text-sm text-gray-500">{{ stats.categorias }} categorías • {{ stats.entregas }} entregas</div>
      </div>

      <div class="bg-white p-4 rounded shadow col-span-1 lg:col-span-2">
        <h3 class="mb-3 font-medium">Entregas recientes</h3>
        <table class="w-full text-sm">
          <thead class="text-left text-gray-600">
            <tr><th class="py-1">Usuario</th><th>Ejercicio</th><th>Fecha</th></tr>
          </thead>
          <tbody>
            <tr v-for="u in stats.ultimas_entregas" :key="u.fecha_envio" class="border-t">
              <td class="py-2">{{ u.usuario }}</td>
              <td class="py-2">{{ u.ejercicio }}</td>
              <td class="py-2">{{ formatDate(u.fecha_envio) }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Canvas para gráficos (si instalas Chart.js) -->
      <div class="bg-white p-4 rounded shadow">
        <h3 class="mb-2">Gráfico de entregas (últimos 7 días)</h3>
        <canvas id="chartDeliveries" width="400" height="200"></canvas>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { API_URL } from '../../api.js'
let chartInstance = null

const stats = ref({
  usuarios: 0, admins: 0, alumnos: 0, categorias: 0, ejercicios: 0, entregas: 0, ultimas_entregas: []
})

function getToken(){ return localStorage.getItem('token') }

function formatDate(d){ try { return new Date(d).toLocaleString() } catch { return d } }

async function cargar(){
  try{
    const res = await fetch(`${API_URL}/api/admin/estadisticas`, { headers: { Authorization: `Bearer ${getToken()}` } })
    if (!res.ok) throw new Error('no auth')
    stats.value = await res.json()
    renderChart()
  }catch(err){
    console.error(err)
    alert('Error cargando estadísticas')
  }
}

function renderChart(){
  // si no tienes Chart.js, esta función no hace nada (pero no rompe)
  try{
    const Chart = window.Chart
    if (!Chart) return

    // simulamos datos: conteo por día (si no los tienes, genera aleatorios)
    const labels = []
    const data = []
    for (let i = 6; i >= 0; i--){
      const d = new Date()
      d.setDate(d.getDate() - i)
      labels.push(d.toLocaleDateString())
      data.push(Math.round(Math.random()*10)) // si tu backend ofrece datos reales, usa esos
    }

    const ctx = document.getElementById('chartDeliveries').getContext('2d')
    if (chartInstance) chartInstance.destroy()
    chartInstance = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [{ label: 'Entregas', data, fill: true }]
      },
      options: { responsive: true, plugins: { legend: { display: false } } }
    })
  }catch(err){
    console.warn('Chart error', err)
  }
}

onMounted(()=>{ cargar() })
</script>
